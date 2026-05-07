## MODIFIED Requirements

### Requirement: Wallet Refresh on Focus
The system MUST automatically sync wallet on-chain balances and transactions when the wallet screen regains focus after navigation actions that may have changed confirmation state.

#### Scenario: Auto-refresh after send
- **GIVEN** the user has just completed a send transaction
- **WHEN** they return to the wallet details screen
- **THEN** the wallet balance and transaction list are refreshed automatically

#### Scenario: Pending transaction updates to confirmed without manual refresh
- **GIVEN** an on-chain transaction is shown as pending in the wallet transaction list
- **AND** the transaction receives a blockchain confirmation while the app is active
- **WHEN** the wallet details screen is focused with auto-refresh enabled
- **THEN** the wallet refresh flow runs automatically
- **AND** the transaction status updates from pending to confirmed without manual pull-to-refresh or app restart

#### Scenario: RGB transaction views remain unchanged
- **GIVEN** the user is viewing RGB asset transaction history
- **WHEN** this wallet focus auto-refresh logic runs
- **THEN** the existing RGB transaction refresh behavior remains unchanged
