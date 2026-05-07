## 1. IFA Validation Logic

- [x] 1.1 Update `IssueIfa` total supply validation so `0` is invalid and produces explicit inline error feedback.
- [x] 1.2 Define and enforce amendments validation in `IssueIfa` so blank is invalid, `0` is valid, and invalid inputs never produce blank error states.
- [x] 1.3 Update submit gating in `IssueIfa` to prevent Proceed when validation state is invalid even if fields are non-empty.

## 2. Tests and Verification

- [x] 2.1 Add or update focused Jest tests covering IFA zero total supply rejection, zero amendments acceptance, and non-empty validation messaging.
- [x] 2.2 Run targeted Jest tests for updated IFA validation paths.
- [x] 2.3 Run `yarn test` to ensure no regressions in existing test suites.
- [x] 2.4 Verify impacted UI journey expectations for RGB issuance automation and note Maestro follow-up for `maestro/flows/regression/dev-regression.yaml`.
