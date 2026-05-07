## Why

Long RGB asset names can overflow the available text area in the Assets card row, causing the name to overlap with balance and value text. This breaks readability on the Assets screen and makes balances harder to verify.

## What Changes

- Update asset card name layout styles so long asset names truncate with ellipsis instead of overlapping adjacent fields.
- Preserve current behavior for verified badge, ticker/details text, and balance/value display across RGB asset types.
- Add focused UI test coverage for long asset-name rendering in the asset card component.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `assets`: Asset cards must display long asset names without overlapping balance/value content by truncating name text within its column.

## Impact

- Realm schema touched: No.
- src/services/messaging/ or src/bare/ touched: No.
- Existing Maestro flows affected: No known flow file updates required.
- Affected code: `src/components/AssetCard.tsx` and related component tests.

## Non-goals

- Changing asset sorting, filtering, or card information hierarchy.
- Redesigning the Assets screen visual style beyond overflow prevention.
- Altering send/receive transaction logic or RGB balance calculations.

## Assumptions

- The reported overlap occurs in `AssetCard` name row used by the Assets screen, based on current component usage and issue description.
- `AppText` with `numberOfLines={1}` should show ellipsis when the container width/flex constraints are correctly applied.
