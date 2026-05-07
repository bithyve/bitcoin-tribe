## Context

Currently the app performs PIN/biometric authentication only on cold start (via the
`Splash` screen). Once the user authenticates, the in-memory encryption key stored in
`AppContext.key` persists indefinitely. If the device is left unattended and the app is
sent to the background, an attacker (or anyone who picks up the device) can resume the
app and access the wallet without any re-authentication.

React Native exposes an `AppState` API to observe foreground/background transitions.
MMKV is already used for lightweight key-value persistence throughout the app.

## Goals / Non-Goals

**Goals:**
- Lock the session (require PIN/biometric re-authentication) when the app resumes after
  ≥ 5 minutes of inactivity in the background.
- Integrate with the existing login flow — no new screens are required.

**Non-Goals:**
- User-configurable timeout duration.
- In-app idle timeout (no-touch detection).
- Visual "locking" animation or countdown overlay.

## Decisions

### Decision 1 — Where to place the AppState listener

**Chosen:** Inside the root `Navigator` component using a `navigationRef` (React Navigation
`createNavigationContainerRef`).

**Rationale:** `Navigator` is always mounted and wraps all stacks. Placing the listener here
avoids duplicating it across screens and ensures it fires even when any nested stack is
active.

**Alternative considered:** Inside `AppStack` only. Rejected because `AppStack` is unmounted
when the `LOGINSTACK` is active, and the listener would be lost on navigation transitions.

### Decision 2 — How to represent "app went to background"

**Chosen:** Write the timestamp (`Date.now()`) to the existing `MMKV` store under a new
`BACKGROUND_TIMESTAMP` key the moment the AppState transitions to `background` (or
`inactive` on iOS). Clear the key when the app returns to the foreground.

**Rationale:** MMKV is already used for lightweight per-session flags. Storing in MMKV
(not Realm) is correct because this is a transient UI concern, not business data.

**Alternative considered:** `useRef` in memory only. Rejected because a ref is reset if the
process is killed; MMKV survives a full process restart, ensuring the timeout is honoured
even after an OS-level kill/resume.

### Decision 3 — Session lock mechanism

**Chosen:** Call `setKey(null)` on `AppContext` and use `navigationRef.reset()` to
navigate the root stack to `LOGINSTACK → LOGIN`.

**Rationale:** Clearing the in-memory key ensures that any component still mounted in the
background cannot access decrypted Realm data. `reset()` pops the entire stack and prevents
the user from pressing Back to bypass the lock.

### Decision 4 — Timeout threshold

**Chosen:** 5 minutes (300 000 ms) hard-coded as a module-level constant.

**Rationale:** Aligns with common mobile wallet conventions. Can be made configurable later.

## Files to create or modify

| File | Action |
|------|--------|
| `src/storage/index.ts` | Add `BACKGROUND_TIMESTAMP` to `Keys` enum |
| `src/navigation/Navigator.tsx` | Add `navigationRef`, `AppState` listener, session-lock logic |
| `src/utils/sessionUtils.ts` | *(new)* `SESSION_TIMEOUT_MS` constant + pure helper functions for unit-testable timeout logic |
| `__tests__/sessionUtils.test.ts` | *(new)* Jest unit tests for session-timeout helpers |

**Realm schema changes:** No.  
**`yarn bare-pack` required:** No.  
**Maestro flows to update:** The regression suite at `maestro/flows/regression/dev-regression.yaml`
does not explicitly test background-resume re-auth; no existing flows are broken.

## Risks / Trade-offs

- **iOS inactive state**: On iOS, switching apps briefly passes through `inactive` before
  `background`. The listener treats `inactive` and `background` identically when recording
  the start time, so a brief Control Centre swipe does not start the timeout clock unless it
  stays there for ≥ 5 minutes. → **Accepted** (industry standard approach).
- **Background jobs**: If the app is woken by a background task, `AppState` may briefly
  become `active` and then `background` again, resetting the timer incorrectly.
  → **Mitigation**: Only reset the stored timestamp on a genuine `active` transition that
  triggers the lock check; do not clear if no lock was triggered.
- **No PIN users**: `PinMethod.DEFAULT` users skip the timeout entirely, preserving the
  existing auto-login experience. → **Accepted by design**.

## Migration Plan

1. Add the `BACKGROUND_TIMESTAMP` key to `Keys` enum — backwards-compatible.
2. Ship the `AppState` listener in `Navigator.tsx`.
3. No data migration needed — old MMKV stores without the key will treat it as `undefined`,
   which the listener handles by skipping the lock check.

**Rollback:** Revert `Navigator.tsx` and remove `BACKGROUND_TIMESTAMP` from `Keys`. No
persistent data cleanup required (MMKV is wiped on app uninstall).

## Open Questions

None.
