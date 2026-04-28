<!-- yarn bare-pack: NOT required — no changes to src/services/messaging/ or src/bare/ -->
<!-- Realm schema changes: NONE — no schemaVersion bump needed -->

## Context

The app already defines `DeepLinkFeature.REGISTRY` in `src/utils/DeepLinking.ts` and has a `Relay.lookupAsset(assetId)` relay call, but the deep-link handler in `Home.tsx` only handles the `community` feature. There is also an existing `ApiHandler.addAssetToWallet({ asset })` that inserts a `Coin` record into Realm.

The feature requires:
1. Extending `handleDeepLink` in `Home.tsx`.
2. A new `RegistryAssetScreen` that fetches and presents the asset for confirmation.
3. A thin `ApiHandler.addAssetFromRegistry` wrapper.
4. Navigation route wiring.

## Goals / Non-Goals

**Goals:**
- Intercept `registry` deep links and route to a confirmation screen.
- Fetch asset metadata from the relay via `Relay.lookupAsset`.
- Let the user add a Coin-type registry asset to their wallet.
- Guard against duplicate adds.

**Non-Goals:**
- Collectible/UDA/IFA deep-link add in this iteration.
- Offline caching of registry lookups.
- Modifying the asset issuance or registry enrollment flows.

## Decisions

### Decision 1 — Reuse `Relay.lookupAsset` directly from the screen via React Query `useMutation`
**Rationale**: All other registry calls in the codebase go through `Relay.*` and are wrapped with `useMutation`. Keeping this pattern avoids introducing a bespoke fetch mechanism and integrates naturally with existing loading/error state handling.

*Alternative considered*: Fetching inside `ApiHandler` and exposing a higher-level function. Rejected because it complicates testing and bypasses React Query's cache.

### Decision 2 — New screen `src/screens/assets/RegistryAssetScreen.tsx`
**Rationale**: Asset-detail screens live in `src/screens/assets/`. The new screen follows the same structure as `CoinDetailsScreen.tsx` (header, body, CTA).

*Alternative considered*: A modal bottom sheet. Rejected because deep links can arrive cold-start, and a full screen is safer for navigation stack integrity.

### Decision 3 — `ApiHandler.addAssetFromRegistry` as a thin wrapper around `addAssetToWallet`
**Rationale**: Keeps the handler API consistent. The function accepts `{ asset: Asset }` and internally calls `addAssetToWallet`; the screen can `useMutation` it for loading state.

### Decision 4 — `handleDeepLink` refactored to use `Deeplinking.processDeepLink`
**Rationale**: The existing handler re-implements URL parsing inline. Switching to the canonical `processDeepLink` removes duplication and ensures both universal links (`https://bitcointribe.app/...`) and custom-scheme links (`tribe://...`) are handled consistently.

## Files Created or Modified

| File | Action |
|------|--------|
| `src/screens/assets/RegistryAssetScreen.tsx` | **Create** — new confirmation screen |
| `src/navigation/NavigationRoutes.ts` | **Modify** — add `REGISTRYASSET` |
| `src/navigation/Navigator.tsx` | **Modify** — register `RegistryAssetScreen` |
| `src/navigation/types.ts` | **Modify** — add `REGISTRYASSET` param type |
| `src/screens/home/Home.tsx` | **Modify** — extend `handleDeepLink` |
| `src/services/handler/apiHandler.ts` | **Modify** — add `addAssetFromRegistry` |
| `src/__tests__/registryDeepLink.test.ts` | **Create** — unit tests |

## Risks / Trade-offs

- [Risk] `Relay.lookupAsset` returns asset data for all types, but only `Coin` is fully supported by `addAssetToWallet` in this iteration → Mitigation: Show informational Toast for unsupported types without crashing.
- [Risk] Deep link arrives before wallet is online → Mitigation: Screen shows asset metadata (from registry, no wallet needed); the "Add to Wallet" button checks wallet online status before proceeding.

## Migration Plan

1. Deploy code changes (no DB migration needed).
2. Rollback: revert code files; no Realm rollback required.

## Open Questions

- None at this time.
