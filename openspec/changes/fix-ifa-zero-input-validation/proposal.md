## Why

The IFA issuance form currently accepts `0` for both Total Supply and No of Amendments, then fails on Proceed with a blank error state. This allows logically invalid inputs and gives users no actionable feedback.

## What Changes

- Enforce IFA Total Supply validation as strictly greater than zero.
- Define and enforce IFA Amendments validation as a non-negative integer (including zero).
- Prevent submit when either value is invalid and surface a clear inline error message.
- Remove the blank error state by guaranteeing a user-visible validation message before API submission.
- Realm schema touched: **no**.
- `src/services/messaging/` or `src/bare/` touched: **no**.
- Existing Maestro flows affected: **yes** (IFA issuance user journey behavior changes; flow updates may be needed in `maestro/flows/regression/dev-regression.yaml` and any included RGB issuance steps that submit IFA forms).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `rgb-issuance`: Tighten IFA form validation requirements so Total Supply must be `> 0`, Amendments accepts `>= 0`, and invalid input always shows explicit inline errors instead of blank failure states.

## Impact

- Affected screens/components: `src/screens/collectiblesCoins/IssueIfa.tsx`.
- Affected behavior: IFA form input validation and submit gating.
- Affected tests: IFA validation tests (to be added/updated under existing Jest setup).

## Non-goals

- No changes to API contracts, RGB node issuance semantics, or backend validation behavior.
- No changes to non-IFA issuance screens unless required for shared helper parity.
- No Realm migration, schema updates, or auth flow changes.

## Assumptions

- The issue screenshot and current code imply that blank errors come from proceeding with invalid numeric form values that are not blocked client-side.
- Product intent from the issue is that `Total Supply = 0` is invalid, while Amendments allows `0` as a valid minimum unless explicitly changed later.
