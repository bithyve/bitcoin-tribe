# Tasks: show-multiple-xpubs

## Analysis

The Show xPub screen currently reads the wallet's `xpub` from `useWallets` and
passes it as a single prop to `ShowXPubContainer`, which renders it as a QR code
and copyable string with no context. The `RgbWallet` Realm schema already stores
both `accountXpubVanilla` and `accountXpubColored`. The fix is to source both
fields from Realm and surface them via the existing `SegmentedButtons` component.

## Tasks

- [x] Add `vanillaWallet` and `coloredWallet` keys to `src/loc/content/en.json`
- [x] Update `src/screens/wallet/ShowXPub.tsx` to query `RgbWallet` from Realm and pass both XPUBs to `ShowXPubContainer`
- [x] Update `src/screens/wallet/components/ShowXPubContainer.tsx` to accept `accountXpubVanilla` / `accountXpubColored` props, add `SegmentedButtons` selector (vanilla first), and display the selected XPUB
