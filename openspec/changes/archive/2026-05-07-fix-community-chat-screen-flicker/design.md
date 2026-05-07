## Context

The community chat screen currently renders messages via a React Native `FlatList` in `src/screens/community/components/MessageList.tsx`. During rapid scroll, especially with image rows, the list can flicker due to avoidable reconciliation churn (broad `extraData`, unstable row identity assumptions, and per-render callbacks/styles).

This bugfix is scoped to UI rendering stability in chat and does not modify messaging transport, storage, or room membership logic.

## Goals / Non-Goals

**Goals:**
- Reduce unnecessary list/item re-renders in community chat while preserving current behavior.
- Keep message ordering, inverted scrolling, and row content behavior identical.
- Add focused test coverage around list stability expectations.

**Non-Goals:**
- Redesigning chat row UI or introducing new community features.
- Changing Realm schemas or message persistence behavior.
- Modifying `src/services/messaging/` or `src/bare/` internals.

## Decisions

1. **Stabilize list identity and reconciliation**
   - Keep memoized reversed data and add a deterministic `keyExtractor` using message identity.
   - Why: Stable keys reduce row remounts and visual flicker under fast scroll.
   - Alternative considered: introducing a different list library (e.g., FlashList). Rejected for this fix because it is a larger migration than needed.

2. **Reduce list-wide invalidation scope**
   - Narrow `extraData` to only values that actually change row rendering.
   - Why: Passing broad references can invalidate all rows more often than necessary.
   - Alternative considered: removing `extraData` entirely. Rejected because pending-send UI state still needs controlled invalidation.

3. **Use stable render callbacks**
   - Memoize `renderItem` and separator callbacks.
   - Why: Prevent needless callback identity changes that can trigger additional rendering work.
   - Alternative considered: leaving inline callbacks. Rejected because this is a known source of avoidable render churn in large lists.

4. **Add focused test coverage**
   - Verify the list wiring (stable key extraction and render behavior) in a component test.
   - Why: Prevent regressions in future refactors.

**Files to modify/create:**
- `src/screens/community/components/MessageList.tsx` (modify)
- `src/screens/community/components/__tests__/MessageList.test.tsx` (create or update, depending on existing coverage)

## Risks / Trade-offs

- **[Risk]** Key extraction based on unexpected message fields could collide for malformed data.  
  **Mitigation:** Prefer canonical message id and provide deterministic fallback.
- **[Risk]** Over-optimization could hide legitimate updates.  
  **Mitigation:** Retain required update triggers and validate with targeted tests.
- **[Trade-off]** Additional memoization introduces slightly more code complexity.  
  **Mitigation:** Keep memoization minimal and local to list rendering.

## Migration Plan

- No schema, migration, or deployment sequencing changes are required.
- Rollback by reverting `MessageList` and associated test changes if regressions appear in chat rendering.

## Open Questions

- None for this scoped bugfix.
