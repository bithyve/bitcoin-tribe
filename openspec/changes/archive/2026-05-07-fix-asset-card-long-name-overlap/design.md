## Context

The issue reports that long RGB asset names break the card layout on the Assets screen by overlapping balance/value text. The asset title is rendered inside `src/components/AssetCard.tsx` with `numberOfLines={1}`, but flex constraints in the row do not consistently reserve space for both columns under long-name conditions.

## Goals / Non-Goals

**Goals:**
- Ensure long asset names in the asset card truncate with ellipsis and never overlap balance/value text.
- Preserve existing card content and behavior for all RGB asset schemas.
- Add focused test coverage for the overflow case in the component test suite.

**Non-Goals:**
- Redesigning the Assets screen layout.
- Changing balance/value formatting or asset ordering.
- Modifying asset domain logic, persistence, or API integration.

## Decisions

1. Tighten the horizontal layout constraints in `AssetCard` by using explicit flex behavior for name and amount columns, and by allowing the name text container to shrink (`minWidth: 0` pattern) so truncation can occur.
   - Alternative considered: reducing font size for long names. Rejected because it reduces readability and still risks clipping.
2. Keep truncation as a single line (`numberOfLines={1}`) and rely on React Native ellipsis behavior once width constraints are fixed.
   - Alternative considered: wrapping to two lines. Rejected because it changes card height rhythm and could impact list density.
3. Add a component-level Jest test to verify that long names do not force overlapping behavior by asserting truncation-related props and stable row rendering.

## Risks / Trade-offs

- [Risk] Small style changes could alter spacing for verified badge alignment. → Mitigation: keep badge placement unchanged and validate visually.
- [Risk] Test assertions may be brittle if based on implementation details. → Mitigation: assert stable public props/styles that enforce truncation behavior.

## Migration Plan

- No data migration or schema changes are required.
- Rollback plan: revert `AssetCard` style/test changes if regressions are reported.

## Open Questions

- None.

## Files to be created or modified

- Modify: `src/components/AssetCard.tsx`
- Add/Modify: `src/components/__tests__/AssetCard.test.tsx` (or nearest existing asset-card test file)
