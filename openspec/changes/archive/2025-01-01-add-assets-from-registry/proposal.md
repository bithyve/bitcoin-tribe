# Proposal: Add Assets Directly From Registry

## Intent

Allow users to add RGB assets directly from the Bitcoin Tribe registry by
tapping a deep link. When a registry deep link is opened (e.g., from the
registry website or a shared URL), the app parses the `assetId` from the URL,
fetches the asset metadata from the registry, and navigates to the
`EnterInvoiceDetails` screen with the asset pre-selected so the user can
immediately generate a receive invoice.

## Problem

Currently there is no path from the registry to the in-app receive flow. Users
must manually search for an asset inside `EnterInvoiceDetails` to receive it.
The `DeepLinkFeature.REGISTRY` enum value already exists in `DeepLinking.ts`
but the `handleDeepLink` handler in `Home.tsx` does not react to it.

## Scope

- Extend `handleDeepLink` in `src/screens/home/Home.tsx` to handle the
  `registry` feature deep link.
- Use the existing `Relay.lookupAsset(assetId)` API to fetch asset metadata.
- Navigate to `EnterInvoiceDetails` with `chosenAsset` and `invoiceAssetId`
  pre-filled from the registry response.
- Add a `lookupAssetFromRegistry` helper to `ApiHandler` (or use `Relay`
  directly in the handler) so registry lookup logic lives in the service layer.
- Add Jest unit tests for the deep-link parsing path and the new helper.

## Non-goals

- No new screens — reuse `EnterInvoiceDetails`.
- No Realm schema changes.
- No changes to `src/services/messaging/` or `src/bare/`.
- No change to the registry API or backend.
- No changes to how assets are issued or enrolled.

## Touches Realm Schema

No.

## Touches src/services/messaging/ or src/bare/

No.

## Rollback Plan

This change adds no persistent storage. Rolling back requires reverting the
`handleDeepLink` addition in `Home.tsx` and removing the new `ApiHandler`
helper. No migration is needed.
