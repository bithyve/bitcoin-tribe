## Why

The "Failed to join room" error from the Community Chat screen is displayed via a global Toast even after the user navigates away from the screen. Because `joinRoom` is async and the Toast fires inside a callback that completes after unmount, users see Community-specific error messages appear on unrelated screens (e.g., App Backup), causing confusion and eroding trust.

## What Changes

- Add a mounted-ref guard in `Chat.tsx` so that Toast notifications from `loginToRoom` are only fired while the component is still mounted.
- Cancel the pending `loginToRoom` async operation (or suppress its side-effects) when the component unmounts.
- Apply the same unmount guard to the join-wait timeout Toast in the `joinWaitTimeoutRef` effect.
- Apply equivalent guard in `CreateGroup.tsx` where a similar "Failed to join room" Toast is called after an async operation.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `community`: The requirement for error toasts during room-joining now explicitly states that errors must only be surfaced while the relevant community screen is visible (mounted).

## Impact

- **Files modified**: `src/screens/community/Chat.tsx`, `src/screens/community/CreateGroup.tsx`
- **No Realm schema changes** — this change does not touch the Realm schema (no/no).
- **No src/services/messaging/ or src/bare/ changes** — fix is limited to the screen layer (no/no).
- **No new dependencies**.

## Non-goals

- Suppressing legitimate errors that should still be shown within the Community tab context.
- Changing the global Toast component itself.
- Modifying the `useChat` hook error-state or the `ChatAdapter` internals.
- Adding retry logic or changing the room-joining UX flow.

## Rollback Plan

Not applicable — this change does not modify persistent storage or authentication. Reverting the two screen files to their previous versions fully restores prior behaviour.
