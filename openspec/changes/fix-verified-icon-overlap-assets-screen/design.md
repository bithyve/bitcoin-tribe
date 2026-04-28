## Context

The Assets screen renders RGB asset cards using two components:
- `AssetCard` (`src/components/AssetCard.tsx`): grid card used for all RGB asset types (Coin, Collectible, UDA, IFA)
- `CoinAssetCard` (`src/components/CoinAssetCard.tsx`): list-row card for coin/IFA assets

Both components show: an asset name (or ticker), an optional verified badge icon (`IconVerified`), and a balance amount. The current layout uses `flex` fractions but does not constrain the name text — it can expand and push the verified icon or amount out of bounds, causing overlap.

## Goals / Non-Goals

**Goals:**
- Name text truncates with ellipsis (`numberOfLines={1}` + `flex:1 shrink`) when constrained
- Verified icon stays visible immediately after the name, with 4–6 px gap
- Amount is always right-aligned and never overlapped
- Verified icon is vertically center-aligned with name text

**Non-Goals:**
- Font/color changes
- Other screens beyond AssetCard and CoinAssetCard

## Decisions

### AssetCard layout restructure
The `nameContainer` (currently `flex: 2, flexDirection: 'row'`) needs:
- `flex: 1` (instead of `flex: 2`) so it yields space to the amount column
- `alignItems: 'center'` for vertical icon alignment
- Inner `nameText` gets `flex: 1` (allows shrink/truncation) + `shrink: 1` override via `flexShrink`

The `amountText` gets `flexShrink: 0` so it never collapses, and `paddingLeft: 4` to maintain visual separation.

The `row` removes the `flex: 1` to avoid unnecessary stretching; `nameContainer` + amount sit side-by-side naturally with the name shrinking.

### CoinAssetCard layout fix
The `row` (ticker + icon) currently has no `flex` constraint. Since `contentWrapper` has `flex: 1`, adding `flex: 1` to `row` (or applying `flexShrink: 1` to `titleText`) lets the ticker shrink rather than overflow.

- `titleText` gets `flexShrink: 1` so it truncates when long
- `row` itself doesn't need `flex: 1` since amount is in a separate sibling container

## Risks / Trade-offs

- Adding `flex: 1` to `nameText` may slightly change the visual width of short names — acceptable since layout will still look correct
- If `shrink` is applied too aggressively, single-character tickers might look narrow — verified acceptable since `tagWrapper1` has intrinsic min-width from padding

## Files to be created or modified

- `src/components/AssetCard.tsx` — restructure nameContainer + nameText + amountText styles
- `src/components/CoinAssetCard.tsx` — add flexShrink to titleText, alignItems to row
