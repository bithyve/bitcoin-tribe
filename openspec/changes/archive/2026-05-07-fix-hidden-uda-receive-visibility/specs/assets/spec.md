## MODIFIED Requirements

### Requirement: Asset Visibility Management
The system MUST allow the user to hide any RGB asset (Coin, Collectible, UDA, IFA) from main asset lists, and MUST provide a dedicated hidden-assets screen where all hidden assets can be viewed and restored. The system MUST automatically restore a hidden UDA to visible state when that same UDA is received again by the wallet through a successful transfer.

#### Scenario: Restoring a hidden asset
- **GIVEN** one or more assets are hidden
- **WHEN** the user opens the hidden assets screen and taps an asset
- **THEN** the asset is restored to the main asset lists

#### Scenario: Receiving a previously hidden UDA
- **GIVEN** a UDA is hidden in Wallet A after it was previously sent out
- **WHEN** Wallet A receives the same UDA again through a successful RGB transfer
- **THEN** the system automatically restores that UDA to visible state
- **AND** the UDA appears on the main asset screen

#### Scenario: Hidden UDA not re-received yet (edge case)
- **GIVEN** a UDA is hidden in the wallet
- **WHEN** the wallet refresh runs without a successful transfer receiving that same UDA
- **THEN** the UDA remains hidden
