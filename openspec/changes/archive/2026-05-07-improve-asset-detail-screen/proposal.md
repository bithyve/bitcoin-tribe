## Why

The asset detail screen (UDADetailsScreen, CollectibleDetailsScreen, CoinDetailsScreen) currently has a visually cluttered layout with poor hierarchy — actions like Send, Share, Verify, and Registry are scattered, the preview image is undersized for collectibles/UDAs, and key CTAs can fall below the fold. Improving the layout will reduce cognitive load and help users find the primary action immediately.

## What Changes

- **Increase collectible/UDA preview height** in `UDADetailsScreen` and `AssetDetailsHeader` so the asset image occupies more vertical space.
- **Sticky bottom CTA bar** — add a persistent bottom bar with the primary Send action on all three detail screens (UDA, Collectible, Coin) so the action is always visible within the first viewport.
- **Collapsible metadata sections** — wrap the detail items in `UDADetailsScreen` (issuer, asset info, registry, transaction history) inside an `AccordionSection` component so users can scan and expand sections selectively.
- **Typography hierarchy** — tighten label/value font-size contrast in `Item`, section headings, and the asset name display.
- **Prominent verification badges** — surface the verified status more visually in the detail header and inside the collapsible Issuer section with a larger icon + badge label.

## Capabilities

### New Capabilities

- `asset-detail-sticky-cta`: A sticky bottom action bar shown on asset detail screens exposing Send (and optionally Receive) as always-visible primary CTAs.
- `asset-detail-collapsible-metadata`: Collapsible/accordion UI sections for organizing metadata on the UDA detail screen.

### Modified Capabilities

- None — these are pure UI changes; no spec-level behavioral requirements change.

## Impact

- **Files modified**:
  - `src/screens/assets/UDADetailsScreen.tsx` — preview size, sticky CTA bar, collapsible sections, badge prominence
  - `src/screens/assets/components/AssetDetailsHeader.tsx` — increased image height, larger verification badge
  - `src/screens/assets/CollectibleDetailsScreen.tsx` — sticky CTA bar wiring
  - `src/screens/assets/CoinDetailsHeader.tsx` — typography adjustments (if needed)
- **New files**:
  - `src/components/AccordionSection.tsx` — reusable collapsible section wrapper
  - `src/components/StickyBottomCTA.tsx` — reusable sticky action bar
- **No Realm schema changes** (no)
- **No messaging/bare changes** (no)
- **No Maestro flow changes** (no) — the screens remain reachable via the same navigation routes; no new flows are required, and the existing regression flows do not assert specific layout positions that would break.

## Non-goals

- Redesign the navigation stack or add new routes.
- Change any business logic, balance calculations, or transaction fetching.
- Support light-mode-specific color tokens beyond what the existing theme already provides.
- Add animations beyond what React Native's built-in `LayoutAnimation` provides.

## Assumptions

- The existing `hp`/`wp` responsive helpers from `src/constants/responsive` are used for all sizing (observed throughout the screens).
- `useTheme()` from `react-native-paper` returns an `AppTheme` that includes `colors.roundedCtaBg`, `colors.borderColor`, `colors.headingColor`, and `colors.secondaryHeadingColor` — inferred from existing usage in `UDADetailsScreen` and `AssetDetailsHeader`.
- `useSafeAreaInsets()` is available (imported in `UDADetailsScreen`) and should be used to offset the sticky CTA from the bottom notch.
- The `AccordionSection` component does not require external animation libraries; `Animated` from React Native core is sufficient.

## Rollback Plan

Not applicable — this change does not touch persistent storage, auth, or encryption. Reverting is a straightforward git revert of the modified screen and new component files.
