# home-dashboard-layout

## Purpose

Define the requirements for the redesigned home dashboard in `DefaultCoin.tsx` — a modular, card-based layout that reduces cognitive overload and clearly separates BTC balance, pinned RGB assets, and recent activity.

## Requirements

### REQ-1 BTC Balance Hero Card

- The BTC on-chain balance MUST be displayed as a full-width card at the top of the scroll area, above the pinned asset carousel.
- The card MUST show:
  - A Bitcoin icon (existing `IconBitcoin` SVG).
  - A label string for the "Bitcoin Wallet" section (from `assets.bitcoinBalance`).
  - The formatted sats balance via the existing `DecimalText` sub-component.
- The card MUST be tappable and navigate to `NavigationRoutes.WALLETDETAILS` (preserving testID `btn_btc_wallet`).
- The card MUST use `borderRadius: hp(16)` and appropriate background colors per theme.

### REQ-2 Section Headers

- A "Pinned Assets" section header MUST appear immediately above the asset carousel.
- A "Recent Activity" section header MUST appear immediately above the transactions list.
- Section headers MUST use `AppText` with `secondaryHeadingColor` to visually subordinate them to card content.

### REQ-3 Other Assets Row

- The "Other Assets" count MUST remain visible as a tappable row navigating to `NavigationRoutes.ASSETS` (preserving testID `btn_other_assets`).
- The row MUST display the `totalAssets` count and the label `assets.otherAssets`.
- The row MUST use a horizontal pill layout instead of a square card.

### REQ-4 Whitespace and Spacing

- Vertical spacing between sections MUST be at least `hp(16)`.
- The container horizontal margin MUST be at least `wp(16)`.

### REQ-5 Carousel Unchanged

- The vertical `Carousel` and `Pagination.Basic` indicator MUST remain functionally unchanged.
- testID `carousel_home` MUST be preserved.

### REQ-6 Transactions List Unchanged

- `TransactionsList` props and behaviour MUST remain unchanged.

### REQ-7 No New Dependencies

- No new npm packages may be introduced for this layout change.

### REQ-8 Translation Keys

- Two new translation keys MUST be added to the `home` translations namespace:
  - `pinnedAssets`: displayed above the carousel (e.g. "Pinned Assets").
  - `recentActivity`: displayed above the transactions list (e.g. "Recent Activity").
- Keys MUST be added in all existing locale files under `src/translations/`.
