## Context

The app currently auto-enters AppStack when the encrypted key is available during startup or resume, which can bypass expected inactivity-based relocking. This change is auth-sensitive but does not require Realm schema updates or messaging worklet changes.

## Goals / Non-Goals

**Goals:**
- Enforce inactivity timeout before allowing authenticated navigation.
- Reuse existing login methods (PIN and biometric) without introducing new auth mechanisms.
- Keep the fix isolated to lifecycle/session logic and covered by Jest tests.

**Non-Goals:**
- Any changes to PIN enrollment/reset UX.
- Any changes to key storage format, Realm schema, or migration logic.
- Any changes to send/transfer or backup/restore workflows.

## Decisions

1. **Centralize timeout decision in app lifecycle/session gate**
   - Rationale: avoids duplicating lock logic in each screen and keeps behavior consistent on splash/resume.
   - Alternative considered: checking timeout in each sensitive screen; rejected due to brittleness and coverage gaps.

2. **Use existing configured timeout value and login routes**
   - Rationale: smallest change with no new user setting and no compatibility risk.
   - Alternative considered: adding new timeout settings UI; rejected as out of scope.

3. **Add unit tests around lifecycle timeout branches**
   - Rationale: prevents regressions where stale sessions re-enter AppStack.
   - Alternative considered: only manual verification; rejected due to auth-critical impact.

## Risks / Trade-offs

- **[Risk]** Background timestamp logic may differ slightly across platforms. → **Mitigation:** Keep logic based on existing app-state timestamps and add branch tests for elapsed/non-elapsed paths.
- **[Risk]** Existing tests may mock lifecycle services incompletely. → **Mitigation:** update only focused tests tied to splash/app lifecycle behavior.

## Migration Plan

- No data migration is required.
- Deploy with updated auth gating logic.
- Rollback by reverting this change if users report unexpected relocking/lock bypass.

## Open Questions

- Confirm production timeout value source used in current app lifecycle logic (should remain unchanged).

## Maestro flows to update/verify

- `maestro/flows/regression/dev-regression.yaml` (login/resume path assertions)

## Files to modify

- `src/screens/splash/Splash.tsx`
- `src/services/appLifecycleService.ts` (if needed for timeout gate wiring)
- `__tests__/appLifecycleService.test.ts`
- `__tests__/App.test.tsx` (if navigation gating assertions need updates)
