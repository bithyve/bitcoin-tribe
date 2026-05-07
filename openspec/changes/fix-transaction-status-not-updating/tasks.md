## 1. Investigate and reproduce refresh trigger gap

- [ ] 1.1 Run existing tests/build checks to capture baseline repository health before code changes.
- [ ] 1.2 Inspect wallet screen auto-refresh effect dependencies and identify why pending status is not updating after confirmation.

## 2. Implement focused wallet auto-refresh fix

- [ ] 2.1 Update wallet focus/auto-refresh effect logic so refresh triggers reliably when wallet screen is focused.
- [ ] 2.2 Ensure on-chain transaction status transitions from pending to confirmed without requiring manual refresh/restart.

## 3. Validate with focused tests

- [ ] 3.1 Add/adjust focused Jest tests for the wallet auto-refresh trigger path.
- [ ] 3.2 Run targeted Jest tests for modified files.

## 4. Final verification

- [ ] 4.1 Run `yarn test` to verify no regressions.
- [ ] 4.2 Perform final code review pass to confirm no schema, messaging/bare, or security-impacting changes.
