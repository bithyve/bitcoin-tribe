## Why

Users browsing the Bitcoin Tribe asset registry (via a web browser or external share) should be able to tap a deep link and immediately add that RGB asset to their wallet without having to manually search for or enter an asset ID. Currently the `DeepLinkFeature.REGISTRY` enum value exists but is never handled, leaving the feature incomplete.

## What Changes

- Extend `handleDeepLink` in `Home.tsx` to recognise `DeepLinkFeature.REGISTRY` and navigate to a new confirmation screen.
- Add a new screen `RegistryAssetScreen` (src/screens/assets/) that fetches the asset from the relay registry, shows asset details, and lets the user add it to their wallet.
- Wire the new screen into the navigator and `NavigationRoutes`.
- Add a `addAssetFromRegistry` handler in `apiHandler.ts` that calls `Relay.lookupAsset` and then `addAssetToWallet`.
- Add the `REGISTRYASSET` route to `NavigationRoutes`.

## Capabilities

### New Capabilities
- `registry-asset-deeplink`: Handle incoming deep links with feature `registry` and an `assetId` parameter — look up the asset from the relay, display its details in a confirmation screen, and add it to the local wallet on user confirmation.

### Modified Capabilities
- `deep-linking`: Extend the existing deep-link handler in `Home.tsx` to route `registry` links to the new confirmation screen.

## Impact

- **Realm schema**: No — no new schema or version bump required.
- **src/services/messaging/ or src/bare/**: No — no messaging layer changes.
- Files added/modified:
  - `src/screens/home/Home.tsx` (handleDeepLink extension)
  - `src/screens/assets/RegistryAssetScreen.tsx` (new screen)
  - `src/navigation/NavigationRoutes.ts` (new route constant)
  - `src/navigation/Navigator.tsx` (register new screen)
  - `src/navigation/types.ts` (route param types)
  - `src/services/handler/apiHandler.ts` (new `addAssetFromRegistry` method)
  - `src/__tests__/registryDeepLink.test.ts` (new unit tests)

## Non-goals

- Modifying the registry enrollment flow (AssetRegistryScreen) — that is a separate publish-side concern.
- Supporting deep links for Collectible/UDA/IFA types in this iteration; only `Coin`, `RGB20`, and `NIA` asset types are supported in the MVP.
- Offline / no-network handling beyond surfacing a user-visible error toast.
- Changes to how assets are _issued_ or _transferred_.

## Rollback Plan

No persistent storage is modified by this change. Rolling back requires only reverting the code files listed above; no Realm migration reversal is necessary.
