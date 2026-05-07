## Context

The app supports manually hiding RGB assets via Asset Visibility Management. In the current send/receive cycle for UDAs, a UDA can remain hidden after it is received again, so users do not see it on the asset screen even though the transfer succeeded.

This change targets existing RGB asset sync/update logic and does not introduce new dependencies, schema updates, or messaging/bare changes.

## Goals / Non-Goals

**Goals:**
- Ensure UDA visibility is restored automatically when a previously hidden UDA is received back into the wallet.
- Keep the implementation minimal and scoped to existing asset refresh/update flow.
- Add focused test coverage for the restored-visibility behavior.

**Non-Goals:**
- Changing user-facing hide/unhide UI flows.
- Altering visibility defaults for unrelated asset types.
- Updating transfer protocol, invoice generation, or network logic.

## Decisions

1. **Unhide only on positive receive signal for the same UDA**
   - Rationale: preserves manual hide semantics while fixing the incorrect state after re-receipt.
   - Alternative considered: blanket unhide all hidden UDAs on refresh. Rejected because it breaks user intent.

2. **Apply fix in wallet sync/persistence layer, not UI**
   - Rationale: visibility source-of-truth belongs in persisted asset records; UI should reflect persisted state.
   - Alternative considered: special-case filtering in asset list screen. Rejected as brittle and duplicated logic.

3. **Add unit tests around UDA visibility transition**
   - Rationale: this is business logic and should be protected from regressions in future sync changes.
   - Alternative considered: rely only on manual verification. Rejected due to recurrence risk.

## Risks / Trade-offs

- **[Risk] Receive detection might be too broad and unintentionally unhide in unrelated states** → **Mitigation:** gate unhide by UDA identity and receive-specific conditions already used by sync logic.
- **[Risk] Shared visibility update path could affect other asset types** → **Mitigation:** keep conditional logic UDA-specific and verify existing send/hidden behavior remains intact.

## Migration Plan

- No schema migration required.
- Deploy as application update.
- Rollback by reverting the visibility update logic to current behavior if regressions are found.

## Open Questions

- None.

## Files to be modified

- `src/...` RGB asset sync/update module(s) handling UDA persistence and visibility.
- `src/...` Jest test file(s) covering RGB asset visibility transitions.
