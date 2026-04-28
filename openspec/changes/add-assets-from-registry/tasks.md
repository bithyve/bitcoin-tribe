## 1. Navigation & Routing

- [ ] 1.1 Add `REGISTRYASSET` to the `NavigationRoutes` enum in `src/navigation/NavigationRoutes.ts`
- [ ] 1.2 Add the `REGISTRYASSET` param type (`{ assetId: string }`) to `src/navigation/types.ts`
- [ ] 1.3 Register the `RegistryAssetScreen` in `src/navigation/Navigator.tsx`

## 2. API Handler

- [ ] 2.1 Add `addAssetFromRegistry` static method to `ApiHandler` in `src/services/handler/apiHandler.ts` — it accepts `{ asset: Asset }`, calls `addAssetToWallet`, and returns `{ status: boolean; alreadyExists?: boolean }`

## 3. Registry Asset Screen

- [ ] 3.1 Create `src/screens/assets/RegistryAssetScreen.tsx` with a loading state, error state, and asset-details view
- [ ] 3.2 Call `Relay.lookupAsset(assetId)` on mount via `useMutation` and render name, ticker, and asset type
- [ ] 3.3 Show "Add to Wallet" primary CTA that calls `ApiHandler.addAssetFromRegistry`; on success navigate back to Home and show a success Toast
- [ ] 3.4 Handle "already exists" response with an informational Toast and navigate back
- [ ] 3.5 Handle lookup errors (network/not-found) with an error message view and a retry button

## 4. Deep Link Handler

- [ ] 4.1 Refactor `handleDeepLink` in `src/screens/home/Home.tsx` to use `Deeplinking.processDeepLink` for parsing
- [ ] 4.2 Add a `registry` branch in `handleDeepLink` that validates `assetId` and navigates to `NavigationRoutes.REGISTRYASSET`

## 5. Tests

- [ ] 5.1 Create `src/__tests__/registryDeepLink.test.ts` with unit tests for `Deeplinking.processDeepLink` with registry URLs (valid, missing assetId, unknown scheme)
- [ ] 5.2 Add a unit test verifying `ApiHandler.addAssetFromRegistry` returns `alreadyExists: true` when the coin already exists in Realm
