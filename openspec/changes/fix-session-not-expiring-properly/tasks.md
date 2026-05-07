## 1. Session expiration behavior

- [ ] 1.1 Inspect splash and lifecycle auth gate logic to identify where stale sessions bypass login.
- [ ] 1.2 Implement inactivity-timeout check so foreground resume after timeout always routes to login re-auth flow.

## 2. Verification and regression coverage

- [ ] 2.1 Add/update focused Jest tests validating both non-expired and expired inactivity scenarios.
- [ ] 2.2 Run targeted Jest tests for changed modules and run `yarn test --runInBand`.
- [ ] 2.3 Document and/or validate impacted Maestro regression flow: `maestro/flows/regression/dev-regression.yaml`.
