## Why

The app does not enforce a session timeout after long periods of inactivity. When
the app is sent to the background and then resumed after several minutes, the wallet
remains fully accessible without requiring PIN or biometric re-authentication, exposing
funds and sensitive data if the device is left unattended.

## What Changes

- Add a `BACKGROUND_TIMESTAMP` MMKV key to record when the app transitions to background.
- Add session-timeout logic in the root `Navigator` component using React Native's
  `AppState` API: when the app returns to the foreground after ≥ 5 minutes of inactivity,
  clear the in-memory encryption key and navigate to the LOGIN screen.
- The 5-minute inactivity threshold applies only when a PIN/biometric method is active
  (`PinMethod.PIN` or `PinMethod.BIOMETRIC`). Apps using `PinMethod.DEFAULT` (no PIN)
  are excluded.

## Capabilities

### New Capabilities
- `session-timeout`: Enforces automatic re-authentication when the app is resumed after
  more than 5 minutes in the background.

### Modified Capabilities
- `onboarding`: Add session-expiry re-authentication scenario to existing onboarding spec.

## Impact

- `src/storage/index.ts` — add `BACKGROUND_TIMESTAMP` enum key
- `src/navigation/Navigator.tsx` — add `AppState` listener for background/foreground
  transitions and session-expiry redirect logic
- No Realm schema changes (no)
- No changes to `src/services/messaging/` or `src/bare/` (no)
- Maestro: the regression login flow (`maestro/flows/login/`) may need a new flow
  verifying that the lock screen appears after inactivity; existing happy-path flows
  are unaffected.

## Assumptions

- The session timeout threshold is fixed at 5 minutes (300 seconds). No user-configurable
  setting is introduced in this change.
- "Inactivity" is defined as the duration the app spends in `background` or `inactive`
  state, measured from the moment it first leaves `active`.
- Users with `PinMethod.DEFAULT` (no PIN) skip the timeout to preserve the existing
  auto-login experience.

## Non-goals

- User-configurable timeout duration.
- Showing a visible countdown or warning before locking.
- Locking the session due to in-app inactivity (no touch events); only background
  time is measured.

## Rollback Plan

No persistent storage schema changes are introduced. Removing the `BACKGROUND_TIMESTAMP`
MMKV key and reverting the `AppState` listener in `Navigator.tsx` fully restores the
prior behaviour. The MMKV key is written and deleted at runtime; clearing MMKV storage
is sufficient if a leftover value ever causes an issue.
