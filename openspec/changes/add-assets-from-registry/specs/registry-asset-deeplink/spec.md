## ADDED Requirements

### Requirement: App handles registry deep link with valid assetId
When the app receives a deep link with feature `registry` and a query param `assetId`, it SHALL fetch the asset details from the relay registry and navigate to the `RegistryAssetScreen` confirmation screen.

#### Scenario: Valid registry deep link received while app is foregrounded
- **GIVEN** the app is running and the user is on any screen
- **WHEN** a deep link of the form `tribe://registry?assetId=<id>` or `https://bitcointribe.app/app/prod/registry?assetId=<id>` is received
- **THEN** the app SHALL navigate to the `RegistryAssetScreen` passing `assetId` as a route param

#### Scenario: Valid registry deep link received as cold-start URL
- **GIVEN** the app was not running
- **WHEN** the app is launched via a registry deep link
- **THEN** the app SHALL navigate to `RegistryAssetScreen` after the home screen mounts and processes `Linking.getInitialURL()`

#### Scenario: Registry deep link missing assetId
- **GIVEN** a registry deep link is received
- **WHEN** the `assetId` query param is absent or empty
- **THEN** the app SHALL show an error Toast and NOT navigate

### Requirement: RegistryAssetScreen fetches and displays asset details
The `RegistryAssetScreen` SHALL call `Relay.lookupAsset(assetId)` upon mount, display a loading state while fetching, and render asset details (name, ticker, description/details, asset type) on success.

#### Scenario: Asset found in registry
- **GIVEN** the user has navigated to `RegistryAssetScreen` with a valid `assetId`
- **WHEN** `Relay.lookupAsset` returns `{ status: true, asset: {...} }`
- **THEN** the screen SHALL display the asset's name, ticker, and a primary CTA "Add to Wallet"

#### Scenario: Asset not found in registry
- **GIVEN** the user has navigated to `RegistryAssetScreen` with an `assetId`
- **WHEN** `Relay.lookupAsset` returns `{ status: false }` or throws
- **THEN** the screen SHALL display an error message and a "Go Back" button; the "Add to Wallet" CTA SHALL NOT be shown

#### Scenario: Network error during lookup
- **GIVEN** the device has no internet connectivity
- **WHEN** `Relay.lookupAsset` throws a network error
- **THEN** the screen SHALL show a Toast with the error message and display a retry button

### Requirement: User can add a registry asset to their wallet
After the asset details are displayed, the user SHALL be able to add the RGB coin to their local wallet by pressing "Add to Wallet". The system SHALL call `ApiHandler.addAssetFromRegistry` which calls `addAssetToWallet` internally.

#### Scenario: Asset successfully added (Coin type)
- **GIVEN** the asset exists in the registry and has type `Coin`
- **WHEN** the user presses "Add to Wallet"
- **THEN** the system SHALL call `ApiHandler.addAssetFromRegistry({ asset })`
- **AND** on success, navigate back to Home and show a success Toast

#### Scenario: Asset already exists in wallet
- **GIVEN** the user already has the asset in their wallet (same `assetId` exists in `Coin` collection)
- **WHEN** `ApiHandler.addAssetFromRegistry` is called
- **THEN** the system SHALL show an informational Toast ("Asset already in wallet") and navigate back without duplicating the record

#### Scenario: Asset type not supported
- **GIVEN** the registry asset has a type other than `Coin` (e.g., `Collectible`, `UDA`)
- **WHEN** the asset details are displayed
- **THEN** the "Add to Wallet" CTA SHALL be shown but SHALL show an informational Toast explaining that only Coin assets are supported in this version

### Requirement: Deep-link handler delegates registry links correctly
The `handleDeepLink` function in `Home.tsx` SHALL use `Deeplinking.processDeepLink` to parse all incoming URLs and delegate `DeepLinkFeature.REGISTRY` links to the new `RegistryAssetScreen`.

#### Scenario: handleDeepLink receives a registry feature URL
- **GIVEN** a URL with feature `registry` is received
- **WHEN** `Deeplinking.processDeepLink` returns `{ isValid: true, feature: DeepLinkFeature.REGISTRY, params: { assetId } }`
- **THEN** `navigation.dispatch` SHALL navigate to `NavigationRoutes.REGISTRYASSET` with the `assetId` param

#### Scenario: handleDeepLink receives an unknown feature URL
- **GIVEN** a URL with an unrecognised feature is received
- **WHEN** `Deeplinking.processDeepLink` parses it
- **THEN** no navigation SHALL occur (existing behaviour unchanged)
