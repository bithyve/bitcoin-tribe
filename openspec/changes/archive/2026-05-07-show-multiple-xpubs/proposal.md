## Why

The XPUB section in wallet settings only displays a single XPUB without context,
making it impossible for users to distinguish between the vanilla (on-chain) wallet
XPUB and the colored (RGB) wallet XPUB. Both keys are needed for different purposes,
and users need to be able to access each clearly.

## What Changes

- The Show xPub screen now displays both `accountXpubVanilla` and `accountXpubColored`
  from the `RgbWallet` Realm schema.
- A `SegmentedButtons` control lets the user switch between "Vanilla Wallet" and
  "Colored Wallet" tabs; vanilla is shown first by default.
- Each tab shows the selected XPUB as a QR code and a copyable string.
- Two new localization keys are added: `vanillaWallet` and `coloredWallet`.

## Capabilities

### New Capabilities
<!-- none introduced -->

### Modified Capabilities
- `wallet`: The Account xPub Export requirement now exposes both vanilla and colored
  XPUBs with a segmented-button selector rather than a single undifferentiated XPUB.

## Impact

- **Realm schema**: No change — `accountXpubVanilla` and `accountXpubColored` already
  exist in `RgbWalletSchema`.
- **Messaging / bare**: Not touched.
- **Maestro flows**: No existing flow exercises the Show xPub screen directly; no
  flow files need updating.
- **Files changed**:
  - `src/screens/wallet/ShowXPub.tsx` — reads RGBWallet from Realm instead of
    wallet specs
  - `src/screens/wallet/components/ShowXPubContainer.tsx` — accepts vanilla/colored
    props, adds SegmentedButtons
  - `src/loc/content/en.json` — adds `vanillaWallet` / `coloredWallet` keys

## Non-goals

- Changing the navigation route, title, or header of the Show xPub screen.
- Supporting additional XPUB types beyond vanilla and colored.
- Modifying the Realm schema or migration scripts.

## Assumptions

- `RgbWallet.accountXpubVanilla` and `accountXpubColored` are always populated when
  `AppType` is `ON_CHAIN` (this is where the Show xPub entry point is shown).
- The existing `SegmentedButtons` component matches the visual style intended for
  this selector.
