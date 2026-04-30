## Context

The Community Chat screen (`src/screens/community/Chat.tsx`) calls `joinRoom` — an async Hyperswarm operation — inside a `useCallback` (`loginToRoom`) that is triggered by a `useEffect`. When the async operation completes (or fails) **after** the component has unmounted (e.g., because the user navigated away), `Toast` is still called with the error message. Because `react-native-root-toast` is a global singleton, the toast appears on whatever screen is currently visible, regardless of context.

The same pattern is present in `CreateGroup.tsx`.

**bare-pack required**: No — no changes to `src/services/messaging/` or `src/bare/`.

**Realm schema changes**: None.

## Goals / Non-Goals

**Goals:**
- Prevent `Toast` calls from firing after a screen unmounts.
- Keep the fix minimal and local to the affected screen components.

**Non-Goals:**
- Altering the `useChat` hook, `ChatAdapter`, or any service layer.
- Changing the Toast component itself.
- Adding retry logic.

## Decisions

### Mounted ref guard
Use the standard React pattern of a `useRef<boolean>` (named `isMountedRef`) initialised to `true` on mount and flipped to `false` in the cleanup function of a `useEffect(() => { ... return () => { isMountedRef.current = false } }, [])`. Before every `Toast(...)` call inside an async callback, check `isMountedRef.current` and skip the toast if it is `false`.

This pattern is safe because:
- `useRef` values are synchronously accessible inside closures, so no race conditions.
- It does not affect the async operation itself — only whether the error is surfaced to the UI after unmount.

### Affected locations in Chat.tsx
1. `loginToRoom` catch block — `Toast('Failed to join room', true)` → guard with `isMountedRef`.
2. `joinWaitTimeoutRef` timeout callback — `Toast('Initialization timed out...', true)` → guard with `isMountedRef`.
3. `loadPeers` catch block — `Toast('Failed to load peers', true)` → guard with `isMountedRef` (same issue pattern).

### Affected locations in CreateGroup.tsx
1. The catch block that calls `Toast('Failed to join room - invalid key or connection error', true)`.

## Files to create or modify

| File | Action |
|---|---|
| `src/screens/community/Chat.tsx` | Modify — add `isMountedRef` guard to all async Toast calls |
| `src/screens/community/CreateGroup.tsx` | Modify — add `isMountedRef` guard to the join-room catch Toast |

## Risks / Trade-offs

- **Masking errors**: If the component unmounts due to a crash rather than navigation, the error is suppressed. Acceptable because `console.error` logs still fire — developers see the error; only the user-facing toast is suppressed.
- **Minimal**: There is no global error state to clear; the fix is purely local, which limits risk.
