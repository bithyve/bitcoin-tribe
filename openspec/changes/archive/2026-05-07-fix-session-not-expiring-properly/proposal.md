## Why

The wallet currently remains directly accessible even after long inactivity, which weakens local-device security expectations for a custodial-style unlock flow. We need session expiry so users must re-authenticate with PIN/biometric after inactivity.

## What Changes

- Add inactivity-based session expiration behavior that routes users back to authentication before wallet access resumes.
- Track app background/foreground transitions and enforce a re-auth lock once inactivity exceeds the configured threshold.
- Ensure both PIN and biometric-enabled setups follow the same session-expiry requirement.
- Add focused unit coverage for lifecycle/session-expiry logic.

## Capabilities

### New Capabilities
- `session-reauthentication`: Enforce PIN/biometric re-authentication after inactivity before allowing AppStack access.

### Modified Capabilities
- None.

## Impact

- Affected code: app lifecycle/session handling, splash/login navigation guard logic, and related tests.
- APIs/dependencies: no external API changes, no new dependencies.
- Realm schema touched: no.
- Touches `src/services/messaging/` or `src/bare/`: no.
- Affects existing Maestro flows: yes — onboarding/login resume paths in `maestro/flows/regression/dev-regression.yaml` should be validated for expected lock behavior.

## Non-goals

- Changing PIN creation, PIN reset, or biometric enrollment UX.
- Changing key storage format or Realm encryption behavior.
- Introducing server-side session expiry.

## Assumptions

- The inactivity threshold can use an existing app timeout/session timeout source in current code rather than introducing new settings UI.
- Session expiry means returning to the existing login screen and requiring the already-configured auth method.

## Rollback plan

If auth/session behavior regresses, revert this change set to restore previous navigation and lifecycle behavior. No persistent-storage migration is required, so rollback is a standard code rollback and redeploy.
