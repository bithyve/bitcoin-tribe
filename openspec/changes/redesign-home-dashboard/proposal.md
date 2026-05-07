## Why

The home screen currently renders wallet balance, RGB asset carousel, BTC balance, asset count, and recent transactions all in one dense view. This creates cognitive overload for new users who cannot quickly identify their BTC balance or distinguish it from RGB assets. The lack of visual hierarchy and whitespace makes navigation feel complex.

## What Changes

- Promote BTC balance to a full-width hero card at the top of the home scroll area with a clear label, replacing the small square balance tile.
- Add visible section headers ("Bitcoin Wallet", "Pinned Assets", "Recent Activity") to clearly delineate content areas.
- Increase vertical spacing (padding/margin) between sections for improved whitespace.
- Remove the side-by-side square layout for BTC balance + other-assets count, replacing with a single full-width BTC card and a separate "Other Assets" row below it.
- Keep the vertical carousel for pinned RGB assets and the transactions list; adjust layout order so BTC balance comes first, then pinned assets, then activity.

## Capabilities

### New Capabilities
- `home-dashboard-layout`: Modular card-based home layout with section headers, full-width BTC balance hero card, and improved whitespace.

### Modified Capabilities
<!-- None — no existing spec-level behavior changes -->

## Impact

- `src/screens/home/DefaultCoin.tsx` — restructure the component layout (BTC hero card, section labels, spacing).
- `src/screens/home/Home.tsx` — no logic changes needed.
- No Realm schema changes.
- No changes to `src/services/messaging/` or `src/bare/`.
- No Maestro flow changes (E2E flows interact with testIDs that remain intact).

## Non-goals

- Redesigning the asset detail screens.
- Changing the asset carousel interaction or swipe mechanics.
- Adding new navigation routes.
- Altering the data-fetching logic or mutations.

## Assumptions

- The `DecimalText` sub-component in `DefaultCoin.tsx` can be reused for the hero BTC balance card.
- Section headers use `AppText` with an existing variant (e.g., `body2`) and the theme's `secondaryHeadingColor`.
- `hp` / `wp` spacing utilities from `src/constants/responsive` are the correct way to add spacing.

## Rollback Plan

No persistent storage is modified; this is a pure UI layout change. Rolling back requires reverting the changes to `DefaultCoin.tsx`.
