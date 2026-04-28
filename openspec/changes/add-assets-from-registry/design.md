# Design: Add Assets Directly From Registry

> yarn bare-pack NOT required (no changes to src/services/messaging/ or src/bare/).
> Realm schema NOT changed.

## Files to Create

| File | Purpose |
|------|---------|
| `src/__tests__/addAssetsFromRegistry.test.ts` | Unit tests for deep-link parsing and registry lookup helper |

## Files to Modify

| File | Change |
|------|--------|
| `src/screens/home/Home.tsx` | Extend `handleDeepLink` to handle `DeepLinkFeature.REGISTRY` |
| `src/services/handler/apiHandler.ts` | Add `lookupAssetFromRegistry` static helper |

## Architecture

### Deep-link URL format

Both universal links and app-link scheme are supported by the existing
`Deeplinking.processDeepLink` utility:

```
# App-link scheme
tribe://registry?assetId=<assetId>

# Universal link (prod)
https://bitcointribe.app/app/prod/registry?assetId=<assetId>

# Universal link (dev)
https://bitcointribe.app/app/dev/registry?assetId=<assetId>
```

### Flow

```
User taps registry deep link
        │
        ▼
Home.tsx::handleDeepLink(event)
        │  Deeplinking.processDeepLink(url)
        │  feature === DeepLinkFeature.REGISTRY
        │  params.assetId present?
        ▼
ApiHandler.lookupAssetFromRegistry(assetId)
        │  calls Relay.lookupAsset(assetId)
        │  returns { asset, status }
        ▼
navigation.navigate(ENTERINVOICEDETAILS, {
  invoiceAssetId: asset.assetId,
  chosenAsset: asset,
})
        │
        ▼
EnterInvoiceDetails (asset pre-selected)
```

### Error handling

| Condition | Behaviour |
|-----------|-----------|
| `assetId` missing from params | silently ignore (no navigation) |
| Registry lookup fails | show Toast error, no navigation |
| `status === false` from registry | show Toast "Asset not found", no navigation |

### ApiHandler.lookupAssetFromRegistry

```ts
static lookupAssetFromRegistry = async (
  assetId: string,
): Promise<{ asset: Asset | null; status: boolean }> => {
  try {
    const response = await Relay.lookupAsset(assetId);
    return { asset: response.asset ?? null, status: response.status };
  } catch (error: any) {
    console.error('Registry lookup error:', error.message || error);
    return { asset: null, status: false };
  }
};
```

### handleDeepLink extension in Home.tsx

```ts
if (category === DeepLinkFeature.REGISTRY) {
  const assetId = params?.assetId;
  if (!assetId) return;
  const result = await ApiHandler.lookupAssetFromRegistry(assetId);
  if (!result.status || !result.asset) {
    Toast(translations.assets.assetNotFound, true);
    return;
  }
  navigation.dispatch(
    CommonActions.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
      invoiceAssetId: result.asset.assetId,
      chosenAsset: result.asset,
    }),
  );
}
```

## Test strategy

Unit-test file: `src/__tests__/addAssetsFromRegistry.test.ts`

- `Deeplinking.processDeepLink` correctly parses `tribe://registry?assetId=abc`
- `Deeplinking.processDeepLink` correctly parses universal link with registry path
- `Deeplinking.processDeepLink` returns `isValid:false` for unknown feature
- `ApiHandler.lookupAssetFromRegistry` returns asset on success
- `ApiHandler.lookupAssetFromRegistry` returns `status:false` on Relay error
