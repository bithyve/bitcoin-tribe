## Context

Wallet transactions currently rely on refresh triggers that do not consistently execute when the wallet details screen regains focus. As a result, transactions may continue to display `Pending` status after they are confirmed on-chain until the user manually refreshes or restarts the app. This change is limited to wallet transaction refresh behavior in existing React Query mutation flows.

## Goals / Non-Goals

**Goals:**
- Ensure wallet transaction status refresh executes reliably while wallet screens are focused.
- Keep changes minimal and localized to wallet refresh trigger logic.
- Add focused test coverage for the auto-refresh behavior.

**Non-Goals:**
- Changing backend confirmation APIs or transaction indexing behavior.
- Modifying Realm schema, migrations, or storage structures.
- Updating messaging/bare services.

## Decisions

1. **Stabilize effect dependencies for focus-driven auto-refresh**
   - Decision: Replace boolean-expression dependencies (`[autoRefresh && isFocused]`) with explicit dependencies and guards inside the effect.
   - Rationale: Boolean-expression dependency arrays can mask transitions and skip required refresh calls when `autoRefresh` or `isFocused` changes independently.
   - Alternative considered: Introduce periodic polling timer. Rejected due to higher battery/network cost and broader behavior change.

2. **Reuse existing refresh mutations instead of introducing new data layer**
   - Decision: Keep using existing `ApiHandler.refreshWallets` / on-chain transaction fetch mutations.
   - Rationale: Existing APIs already provide the updated transaction confirmation status; issue is trigger timing.
   - Alternative considered: Introduce new query subscriptions. Rejected as unnecessary for this bug fix.

3. **Add focused unit coverage around refresh trigger conditions**
   - Decision: Add/adjust tests around wallet screen focus/autoRefresh behavior.
   - Rationale: Prevent regressions in status updates without requiring broad integration refactors.

## Risks / Trade-offs

- [Risk] More frequent refresh calls while focused could increase API usage.
  → Mitigation: Keep trigger conditional (`autoRefresh` and focus) and avoid adding timers.

- [Risk] Changes in effect dependencies may trigger refreshes in edge navigation paths.
  → Mitigation: Keep dependency list minimal and use explicit guards in effect body.

## Migration Plan

- No data migration required (no schema/auth/storage change).
- Deployment: ship with existing release pipeline.
- Rollback: revert wallet refresh trigger changes if unexpected refresh behavior is observed.

## Open Questions

- None; bug scope and fix path are clear from existing wallet refresh logic.

## Files to Modify

- `src/screens/wallet/WalletDetails.tsx`
- `src/screens/wallet/components/WalletTransactionList.tsx` (if needed for consistency)
- Related wallet screen/unit test files for focus auto-refresh behavior
