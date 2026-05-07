# Design: show-multiple-xpubs

> bare-pack required: **No**
> Realm schema changes: **No**

## Overview

Update the Show xPub screen to display both the vanilla (on-chain) and colored
(RGB) wallet extended public keys, using a `SegmentedButtons` selector so the
user can switch between them with clear labeling.

## Affected Files

| File | Change |
|------|--------|
| `src/screens/wallet/ShowXPub.tsx` | Replace `useWallets` with `useQuery(RealmSchema.RgbWallet)` to read both XPUBs |
| `src/screens/wallet/components/ShowXPubContainer.tsx` | Accept `accountXpubVanilla` / `accountXpubColored`; add `SegmentedButtons` |
| `src/loc/content/en.json` | Add `vanillaWallet` and `coloredWallet` keys |

## Implementation Details

### ShowXPub.tsx

- Remove the `useWallets` hook import (no longer needed).
- Import `useQuery` from `@realm/react` and `RealmSchema` from `src/storage/enum`.
- Import `RGBWallet` from `src/models/interfaces/RGBWallet`.
- Query `useQuery(RealmSchema.RgbWallet)[0]` to obtain the `RGBWallet` object.
- Pass `accountXpubVanilla` and `accountXpubColored` as props to `ShowXPubContainer`.

### ShowXPubContainer.tsx

- Replace the single `xpub` prop with `accountXpubVanilla: string` and
  `accountXpubColored: string`.
- Add local state `selectedXpub: 'vanilla' | 'colored'`, defaulting to `'vanilla'`.
- Render `SegmentedButtons` (from `src/components/SegmentedButtons`) above the
  `ScrollView` with two buttons:
  - `{ value: 'vanilla', label: wallet.vanillaWallet }`
  - `{ value: 'colored', label: wallet.coloredWallet }`
- Derive `xpub` from `selectedXpub` and pass it to `ShowQRCode` and
  `ReceiveQrClipBoard`.

### Localization (en.json)

Add two keys inside the `wallet` object:

```json
"vanillaWallet": "Vanilla Wallet",
"coloredWallet": "Colored Wallet"
```

## Data Flow

```
Realm (RgbWallet) ──► ShowXPub ──► ShowXPubContainer
                                        │
                              SegmentedButtons (vanilla | colored)
                                        │
                              ShowQRCode + ReceiveQrClipBoard
```

## Edge Cases

- If `rgbWallet` is undefined (unlikely in ON_CHAIN mode but guarded by `?.`),
  `xpub` will be `undefined`; the QR/copy components will render an empty state
  rather than crashing.
