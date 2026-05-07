## 1. Session expiration behavior

- [x] 1.1 Inspect splash and lifecycle auth gate logic to identify where stale sessions bypass login.
- [x] 1.2 Implement inactivity-timeout check so foreground resume after timeout always routes to login re-auth flow.

## 2. Verification and regression coverage

- [x] 2.1 Add/update focused Jest tests validating both non-expired and expired inactivity scenarios.
- [x] 2.2 Run targeted Jest tests for changed modules and run `yarn test --runInBand`.
- [x] 2.3 Document and/or validate impacted Maestro regression flow: `maestro/flows/regression/dev-regression.yaml`.
