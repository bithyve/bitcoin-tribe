## Overview

Restructure `src/screens/home/DefaultCoin.tsx` to introduce a modular card-based layout with clear section headers, a full-width BTC balance hero card, and improved vertical spacing. All data-fetching and navigation logic is preserved; only the render tree and styles change.

## Layout Structure (after redesign)

```
<View container>                         ← marginHorizontal: wp(10)
  ├── BTC Balance Hero Card              ← full-width, replaces left square
  │     ├── IconBitcoin
  │     ├── AppText "Bitcoin Wallet"     ← section label (body2, secondaryHeadingColor)
  │     └── DecimalText balance + "sats"
  │
  ├── AppText "Pinned Assets" header     ← section label (body2, secondaryHeadingColor), marginTop hp(20)
  │
  ├── <View row>                         ← carousel + pagination dots (unchanged)
  │     ├── Carousel (vertical, preset assets)
  │     └── Pagination scroll indicator
  │
  ├── AppText "Other Assets" row         ← new touchable row replacing right square card
  │     └── navigate → ASSETS
  │
  ├── AppText "Recent Activity" header   ← section label, marginTop hp(16)
  │
  └── TransactionsList                   ← unchanged
```

## File Changes

### `src/screens/home/DefaultCoin.tsx`

1. **BTC hero card** — Replace the `styles.balanceContainer` square (left) with a new full-width card:
   - Style: `btcHeroCard` — `borderRadius: hp(16)`, background `#111` (dark) / `#fff` (light), `padding: hp(20)`, `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `marginBottom: hp(16)`.
   - Left side: `IconBitcoin` (existing SVG), below it `AppText body2 secondaryHeadingColor` with translation `assets.bitcoinBalance`, then `DecimalText` for sats.
   - Right side: arrow/chevron icon navigating to `NavigationRoutes.WALLETDETAILS`.
   - Entire card is wrapped in `AppTouchable` (testID `btn_btc_wallet`) — preserves existing E2E ID.

2. **Section headers** — Insert `AppText` labels above the carousel and above the transactions list:
   - Style: `sectionHeader` — `color: theme.colors.secondaryHeadingColor`, `marginBottom: hp(8)`, `marginTop: hp(20)`.
   - Text values come from new translation keys (see Specs), falling back to `assets.bitcoinBalance` / `assets.otherAssets` patterns already present.

3. **"Other Assets" row** — Keep `AppTouchable` (testID `btn_other_assets`) navigating to `ASSETS`. Change layout from square card to a horizontal pill row:
   - Style: `otherAssetsRow` — `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `borderRadius: hp(12)`, background matches secondary card colour, `padding: hp(16)`, `marginBottom: hp(8)`.

4. **Spacing updates** — Increase `container` marginHorizontal from `wp(10)` to `wp(16)` and add `paddingBottom: hp(20)` for scroll breathing room.

5. **Remove** the `styles.row` wrapping both square cards; the two tiles are now separate stacked elements.

## Style Constants

| Style key | Dark | Light |
|-----------|------|-------|
| `btcHeroCard.backgroundColor` | `#111111` | `#FFFFFF` |
| `otherAssetsRow.backgroundColor` | `#1C1C1C` | `#F5F5F5` |
| `sectionHeader.color` | `theme.colors.secondaryHeadingColor` | same |

## Translation Keys (new)

No new keys needed. Reuse:
- `assets.bitcoinBalance` (already present) as the BTC section label.
- `assets.otherAssets` (already present) as the other-assets row label.
- Add `home.pinnedAssets` and `home.recentActivity` section header labels (see Specs for exact strings).

## No Realm / Messaging / Maestro Changes

- Realm schema: no change.
- `src/services/messaging/` or `src/bare/`: no change.
- Maestro flows: testIDs `btn_btc_wallet`, `btn_other_assets`, `carousel_home` are preserved.
