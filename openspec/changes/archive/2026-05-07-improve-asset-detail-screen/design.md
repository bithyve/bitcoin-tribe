# Design: Improve Asset Detail Screen

> `yarn bare-pack` required: **NO** — no changes to `src/services/messaging/` or `src/bare/`  
> Realm schema changes: **NO**  
> Maestro flow changes: **NO**

---

## Files to Create

| Path | Purpose |
|---|---|
| `src/components/AccordionSection.tsx` | Reusable collapsible section wrapping arbitrary children behind a tappable header |
| `src/components/StickyBottomCTA.tsx` | Reusable sticky bottom action bar with Send (primary) and optional secondary buttons |

## Files to Modify

| Path | Changes |
|---|---|
| `src/screens/assets/UDADetailsScreen.tsx` | Increase preview height; wrap detail items in `AccordionSection`; add `StickyBottomCTA` |
| `src/screens/assets/components/AssetDetailsHeader.tsx` | Increase `assetBackImageContainer` height from `hp(235)` to `hp(300)`; enlarge verification badge icon |
| `src/screens/assets/CollectibleDetailsScreen.tsx` | Add `StickyBottomCTA` wired to the existing send/receive handlers |

---

## Component: `AccordionSection`

```tsx
// src/components/AccordionSection.tsx
type AccordionSectionProps = {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;    // default false
};
```

**Behaviour**:
- Uses `useState` for open/close; animates chevron rotation with `Animated.timing` on an `Animated.Value`.
- Content visibility is handled via conditional rendering (`{open && <View>{children}</View>}`) rather than height animation, keeping the implementation simple and performant.
- Chevron icon (▼/▶) rotates 180° when open — driven by an `Animated.Value` interpolated to `'0deg'` / `'180deg'`.
- Styled with `theme.colors.borderColor` bottom border on the header row.
- Section header uses `AppText variant="body1"` styled with `theme.colors.headingColor`.
- Section body renders children inside a `View` that is hidden when closed.

---

## Component: `StickyBottomCTA`

```tsx
// src/components/StickyBottomCTA.tsx
type StickyBottomCTAProps = {
  onPressSend: () => void;
  sendDisabled?: boolean;
  sendLabel?: string;          // default "Send"
};
```

**Behaviour**:
- Renders with `position: 'absolute'`, `bottom: insets.bottom + hp(10)`, `left: wp(16)`, `right: wp(16)`.
- `zIndex: 1000` so it always floats above scroll content.
- Send button: full-width, pill-shaped (`borderRadius: hp(28)`), background `theme.colors.primaryCTA` (orange from AppTheme).
- When `sendDisabled` is true, opacity is `0.4` and `disabled` prop is set on `AppTouchable`.
- Label: `AppText variant="body1"` bold, white.

---

## UDADetailsScreen changes

### Preview size
- The `ZoomableImage` is already full-width. No change needed — it fills the ScrollView from `top: 0` naturally.

### Sticky CTA
- Import and render `<StickyBottomCTA>` at the root level (outside `ScrollView`), in the `GestureHandlerRootView`.
- `onPressSend` calls `navigation.navigate(NavigationRoutes.SCANASSET, { assetId, rgbInvoice: '', isUDA: true })`.
- `sendDisabled={uda?.balance?.spendable < 1}`.
- The existing icon-button bottom bar (`bottomContainer`) is retained for Share/Info/Copy/Download while in image-view mode.

### ScrollView bottom padding
- Add `contentContainerStyle={{ paddingBottom: insets.bottom + hp(80) }}` to the `ScrollView` so content clears the sticky bar.

### Collapsible metadata sections (info view only)
Wrap the existing info-view content (`!imageView` branch) in three `AccordionSection` groups:

1. **Issuer** (`initiallyOpen={true}`):  
   - `IssuerVerified`, `IssuerDomainVerified`, `VerifyIssuer` components  
   - Show verification badge header decoration when `verified === true`

2. **Asset Info**:  
   - `Item` rows: issued date, name, ticker, asset ID (`NewAssetIdContainer`), description

3. **Activity & Registry** (only when `isAddedInRegistry || hasIssuanceTransaction`):  
   - Asset transaction row  
   - Registry link (`SelectOption`)  
   - X post import (`SelectOption`)

### Typography / badge prominence
- In `Item` component: increase `valueText` to `variant="heading2Bold"` (already set) — no change needed.
- `labelText` remains `variant="body2"` with `secondaryHeadingColor` — this already has enough contrast.
- For the `isVerified` indicator in `AssetDetailsHeader`, increase icon size from `20×20` to `28×28` and add a short label `"Verified"` next to it using `AppText variant="caption"` with the `Eucalyptus` color (`rgba(59, 204, 160, 1)`) from `Colors.ts`.

---

## AssetDetailsHeader changes

- `assetBackImageContainer` height: `hp(235)` → `hp(300)`.
- `assetBackImageRadius` height: `hp(235)` → `hp(300)`.
- `IconVerified` icon: `width={20} height={20}` → `width={28} height={28}`.
- Add a `"Verified"` text label (`AppText variant="caption"`) next to the icon in the `assetNameWrapper` row, colored with `Colors.Eucalyptus`.

---

## CollectibleDetailsScreen changes

- Import and render `<StickyBottomCTA>` below the existing `<AssetDetailsHeader>` / `<TransactionsList>` block.
- Pass `onPressSend` with the existing send navigation logic (guarded by `isNodeInitInProgress`).
- `sendDisabled={collectible?.balance?.spendable < 1}`.
- Add `paddingBottom: hp(80)` to the `transactionContainer` style so the list clears the CTA bar.

---

## Verification

- `yarn test` — no new business logic; existing tests should still pass.
- Manual smoke test: open each of UDA, Collectible, and Coin detail screens and verify sticky bar + expanded preview.
