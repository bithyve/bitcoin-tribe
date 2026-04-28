## MODIFIED Requirements

### Requirement: Deep link handler routes to correct screen
The deep-link handler in `Home.tsx` SHALL parse all incoming URLs via `Deeplinking.processDeepLink` and route each recognised `DeepLinkFeature` to the appropriate screen. Supported features:
- `community` → `NavigationRoutes.CREATEGROUP`
- `registry` → `NavigationRoutes.REGISTRYASSET` (new)

#### Scenario: Community deep link received
- **GIVEN** a URL with feature `community` is received
- **WHEN** `handleDeepLink` processes it
- **THEN** navigation SHALL dispatch to `NavigationRoutes.CREATEGROUP` with parsed params

#### Scenario: Registry deep link received
- **GIVEN** a URL with feature `registry` is received
- **WHEN** `handleDeepLink` processes it
- **THEN** navigation SHALL dispatch to `NavigationRoutes.REGISTRYASSET` with `{ assetId }` param

#### Scenario: Unrecognised deep link received
- **GIVEN** a URL with an unknown feature is received
- **WHEN** `handleDeepLink` processes it
- **THEN** no navigation SHALL occur and a warning SHALL be logged
