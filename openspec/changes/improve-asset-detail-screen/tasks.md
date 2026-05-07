# Tasks: Improve Asset Detail Screen

## Analysis

Addressing visual clutter and poor CTA discoverability across three asset detail screens:
- `UDADetailsScreen` (UDA / unique digital assets)
- `CollectibleDetailsScreen` (collectibles)
- `CoinDetailsScreen` (fungible RGB coins, via `AssetDetailsHeader`)

Changes are pure UI — no Realm schema, no messaging/bare, no Maestro flow updates required.

---

## Tasks

### 1. New shared components

- [x] **1.1** Create `src/components/AccordionSection.tsx`
  - Props: `title: string`, `children: React.ReactNode`, `initiallyOpen?: boolean`
  - Uses `useState` for open/close; animates chevron rotation with `Animated.Value`
  - Uses `useTheme()` + `AppText` for consistent styling with existing screens
  - Uses `AppTouchable` for the tappable header row

- [x] **1.2** Create `src/components/StickyBottomCTA.tsx`
  - Props: `onPressSend: () => void`, `sendDisabled?: boolean`, `sendLabel?: string`
  - Positioned with `position: 'absolute'`, offset by `useSafeAreaInsets().bottom`
  - Full-width pill-shaped Send button using `AppTouchable` + `AppText`
  - `sendDisabled` prop sets opacity and disables touch

### 2. AssetDetailsHeader — larger preview + bolder verification badge

- [x] **2.1** In `src/screens/assets/components/AssetDetailsHeader.tsx`:
  - Increase `assetBackImageContainer` and `assetBackImageRadius` height from `hp(235)` to `hp(300)`
  - Increase `IconVerified` icon dimensions from `20×20` to `28×28`
  - Add `"Verified"` text label next to the icon in the `assetNameWrapper` row using `AppText variant="caption"` with `Colors.Eucalyptus` color

### 3. UDADetailsScreen — sticky CTA + collapsible sections

- [x] **3.1** In `src/screens/assets/UDADetailsScreen.tsx`:
  - Import `StickyBottomCTA` and render it inside `GestureHandlerRootView`, outside the `ScrollView`, so it always floats
  - Wire `onPressSend` to the existing SCANASSET navigation (guard with `isNodeInitInProgress` toast)
  - Set `sendDisabled={uda?.balance?.spendable < 1}`
  - Add `paddingBottom: insets.bottom + hp(80)` to `ScrollView` `contentContainerStyle` so info content clears the bar

- [x] **3.2** In `UDADetailsScreen` info view (`!imageView` branch):
  - Import `AccordionSection` and wrap existing content into three collapsible sections:
    1. **Issuer** (`initiallyOpen={true}`): `IssuerVerified`, `IssuerDomainVerified`, `VerifyIssuer`
    2. **Asset Info**: `Item` rows (issued date, name, ticker, asset ID, description)
    3. **Activity & Registry** (conditional): transaction row, registry link, X post import
  - Preserve all existing conditional guards (`hasIssuanceTransaction`, `isAddedInRegistry`, etc.)
  - Remove redundant `seperatorView` dividers between sections (the accordion header borders provide visual separation)

### 4. CollectibleDetailsScreen — sticky CTA

- [x] **4.1** In `src/screens/assets/CollectibleDetailsScreen.tsx`:
  - Import and render `StickyBottomCTA` at the root level (below `TransactionsList`)
  - Wire `onPressSend` with existing guard logic (`isNodeInitInProgress` toast, then navigate to SCANASSET)
  - Set `sendDisabled={collectible?.balance?.spendable < 1}`
  - Add `paddingBottom: hp(80)` to `transactionContainer` style so the list clears the bar

### 5. Verification

- [x] **5.1** Run `yarn test` and confirm no regressions
