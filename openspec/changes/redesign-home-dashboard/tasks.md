# Tasks: redesign-home-dashboard

## Analysis

The home screen's `DefaultCoin.tsx` renders all content (BTC balance, RGB carousel, other assets, transactions) in a flat layout with minimal visual hierarchy. The goal is to add section headers, promote the BTC balance to a full-width hero card, and improve spacing without changing any data-fetching or navigation logic.

## Tasks

- [ ] 1. Add `pinnedAssets` and `recentActivity` translation keys to all locale files under `src/translations/`.
- [ ] 2. Restructure `DefaultCoin.tsx` layout: promote BTC balance to a full-width hero card at the top; add "Pinned Assets" and "Recent Activity" section headers; convert the "Other Assets" tile to a horizontal row; improve container spacing.
- [ ] 3. Update styles in `DefaultCoin.tsx`: add `btcHeroCard`, `otherAssetsRow`, `sectionHeader` style entries; remove unused `row`-wrapping style for the two-square layout; adjust `container` margins.
