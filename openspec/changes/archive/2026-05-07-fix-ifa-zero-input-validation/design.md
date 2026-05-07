## Context

`IssueIfa` in `src/screens/collectiblesCoins/IssueIfa.tsx` sanitizes numeric input but currently treats `0` as present/valid for both Total Supply and replace rights. Submission proceeds, then a downstream failure can surface as a blank error toast/state.

This change is limited to UI/form validation on RGB IFA issuance. It does not alter RGB API contracts, storage, schema, or authentication.

User-visible behavior changes impact the IFA issuance flow, so Maestro regression coverage for RGB issuance should be reviewed.

## Goals / Non-Goals

**Goals:**
- Ensure IFA Total Supply accepts only values greater than zero.
- Define IFA Amendments (replace rights) as non-negative integer input where zero is valid.
- Guarantee explicit inline validation errors before submission for invalid values.
- Keep changes localized to IFA form logic with minimal risk.

**Non-Goals:**
- No changes to API-level validation in RGB services.
- No Realm schema or migration updates.
- No changes to messaging/bare modules.

## Decisions

1. **Retain numeric sanitization and add explicit semantic validation checks**
   - Decision: Continue using digit-only sanitization, then validate numeric meaning (`> 0` for supply; `>= 0` for amendments).
   - Rationale: Minimal, consistent with current form behavior and keyboard handling.
   - Alternative considered: reject `'0'` during typing. Rejected because inline error on submit/input is clearer and less disruptive.

2. **Block submission when any field-specific validation error exists**
   - Decision: Update submit gating and submit handler to check validation state, not just non-empty strings.
   - Rationale: Prevents downstream API call attempts with semantically invalid values and avoids blank error states.
   - Alternative considered: rely solely on API errors. Rejected because issue demonstrates poor UX and non-actionable feedback.

3. **Use existing localized asset strings for error text where available**
   - Decision: Reuse current translation keys where they correctly communicate invalid input; add minimal fallback text only if required.
   - Rationale: Maintains localization consistency with least change footprint.

4. **Files to modify**
   - `src/screens/collectiblesCoins/IssueIfa.tsx`
   - `__tests__/...` (targeted IFA validation tests, existing test location/pattern)
   - `openspec/changes/fix-ifa-zero-input-validation/tasks.md`

5. **Maestro flows to review/update (if automated UI assertions exist for this path)**
   - `maestro/flows/regression/dev-regression.yaml` (and referenced RGB issuance flow fragments if applicable)

## Risks / Trade-offs

- **[Risk]** Tightened submit gating could unintentionally block a previously accepted edge input (e.g., blank-trim interactions).  
  **→ Mitigation:** Add targeted tests for valid non-zero supply and zero amendments, and verify submit enabling/disabling transitions.

- **[Risk]** Reusing existing translation keys may produce less-specific copy than ideal.  
  **→ Mitigation:** Prefer existing key with clear meaning; if not clear, use minimal explicit message in code path and keep scope narrow.
