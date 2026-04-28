## 1. Fix AssetCard layout (src/components/AssetCard.tsx)

- [x] 1.1 Update `nameContainer` style: change `flex: 2` → `flex: 1`, add `alignItems: 'center'`, add `overflow: 'hidden'`
- [x] 1.2 Update `nameText` style: add `flex: 1` and `flexShrink: 1` so name truncates with ellipsis when constrained
- [x] 1.3 Update `IconVerified` usage: add `marginLeft: 5` and `flexShrink: 0` to prevent the icon from being squeezed
- [x] 1.4 Update `amountText` style: add `flexShrink: 0` so it never collapses, add `paddingLeft: 4` for visual separation from name group
- [x] 1.5 Update `row` style: remove `flex: 1`, add `alignItems: 'center'` for vertical centering of name + icon + amount

## 2. Fix CoinAssetCard layout (src/components/CoinAssetCard.tsx)

- [x] 2.1 Update `titleText` style: add `flexShrink: 1` so ticker truncates when space is constrained
- [x] 2.2 Update `row` style: add `flex: 1` so it occupies available width inside `contentWrapper` (preventing overflow into sibling amount badge)
