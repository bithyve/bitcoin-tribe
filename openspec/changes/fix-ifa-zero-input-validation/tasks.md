## 1. IFA Validation Logic

- [ ] 1.1 Update `IssueIfa` total supply validation so `0` is invalid and produces explicit inline error feedback.
- [ ] 1.2 Define and enforce amendments validation in `IssueIfa` so blank is invalid, `0` is valid, and invalid inputs never produce blank error states.
- [ ] 1.3 Update submit gating in `IssueIfa` to prevent Proceed when validation state is invalid even if fields are non-empty.

## 2. Tests and Verification

- [ ] 2.1 Add or update focused Jest tests covering IFA zero total supply rejection, zero amendments acceptance, and non-empty validation messaging.
- [ ] 2.2 Run targeted Jest tests for updated IFA validation paths.
- [ ] 2.3 Run `yarn test` to ensure no regressions in existing test suites.
- [ ] 2.4 Verify impacted UI journey expectations for RGB issuance automation and note Maestro follow-up for `maestro/flows/regression/dev-regression.yaml`.
