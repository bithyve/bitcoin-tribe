## Why

On the Assets screen, the verified badge icon overlaps the asset amount value when asset names are long. This causes a broken visual layout where critical information (balance) is obscured.

## What Changes

- Fix `AssetCard` component (`src/components/AssetCard.tsx`): restructure the name + verified icon row so the name truncates with ellipsis and the amount stays right-aligned without overlap
- Fix `CoinAssetCard` component (`src/components/CoinAssetCard.tsx`): ensure the ticker text + verified icon row doesn't overflow into the amount badge when the ticker is long
- Add proper `flex` constraints, `shrink`, and spacing styles so verified icon is always visible and never overlaps the amount

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- No spec-level behavior changes; this is a pure UI layout fix -->

## Impact

- Affected files: `src/components/AssetCard.tsx`, `src/components/CoinAssetCard.tsx`
- No Realm schema changes: **no**
- Touches `src/services/messaging/` or `src/bare/`: **no**
- No API changes, no new dependencies

## Non-goals

- Changing font sizes, colors, or other visual design properties beyond layout
- Modifying asset detail screens or any screen other than the asset card list items
- Adding animation or transitions

## Rollback Plan

N/A — this change does not modify persistent storage or auth. Reverting the two component files restores prior behavior.
