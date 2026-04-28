# Tasks: Add Assets Directly From Registry

## Analysis

The `DeepLinkFeature.REGISTRY` enum value already exists in `src/utils/DeepLinking.ts`
but the `handleDeepLink` handler in `src/screens/home/Home.tsx` only handles the
`community` feature. This change wires up the `registry` feature by:

1. Adding `ApiHandler.lookupAssetFromRegistry` that wraps `Relay.lookupAsset`.
2. Extending `handleDeepLink` in `Home.tsx` to call the new helper and navigate
   to `EnterInvoiceDetails` with the asset pre-selected.
3. Adding Jest unit tests for the deep-link parsing and the new helper.

---

## Tasks

- [ ] 1.1 Add `lookupAssetFromRegistry` static helper to `ApiHandler` in
      `src/services/handler/apiHandler.ts`. The method accepts an `assetId`
      string, calls `Relay.lookupAsset(assetId)`, and returns
      `{ asset: Asset | null; status: boolean }`. Catches errors and returns
      `{ asset: null, status: false }` on failure.

- [ ] 1.2 Extend `handleDeepLink` in `src/screens/home/Home.tsx`:
      - Import `DeepLinkFeature` from `src/utils/DeepLinking` (already imported as `Deeplinking`).
      - Make `handleDeepLink` async.
      - After the existing `community` branch, add a branch for `DeepLinkFeature.REGISTRY`:
        parse `assetId` from params; if missing, return early.
        Call `ApiHandler.lookupAssetFromRegistry(assetId)`.
        On failure or `status === false`, show a Toast with a localised error.
        On success, navigate to `NavigationRoutes.ENTERINVOICEDETAILS` with
        `invoiceAssetId` and `chosenAsset`.

- [ ] 1.3 Add localisation string `assetNotFound` to the `assets` translation
      namespace if it does not already exist, so the Toast in task 1.2 can use a
      proper string. Check `src/contexts/LocalizationContext.tsx` and the
      relevant strings file.

- [ ] 2.1 Create `src/__tests__/addAssetsFromRegistry.test.ts` with the
      following test cases:
      - `Deeplinking.processDeepLink` correctly parses
        `tribe://registry?assetId=abc123` → `{ isValid: true, feature: 'registry', params: { assetId: 'abc123' } }`
      - `Deeplinking.processDeepLink` correctly parses a universal link
        containing `/registry?assetId=abc123`.
      - `ApiHandler.lookupAssetFromRegistry` calls `Relay.lookupAsset` and
        returns the asset on success.
      - `ApiHandler.lookupAssetFromRegistry` returns `{ asset: null, status: false }`
        when `Relay.lookupAsset` throws.
