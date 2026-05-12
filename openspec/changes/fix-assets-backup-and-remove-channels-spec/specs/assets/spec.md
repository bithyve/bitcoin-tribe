## MODIFIED Requirements

### Requirement: Campaign Reward Claim
WHEN appType is `NODE_CONNECT`, the system MUST present a claim button on a Coin detail screen when the coin has an active campaign and the user is eligible.

#### Scenario: Successful witness campaign claim
- **GIVEN** the coin has an active witness campaign and the user meets eligibility criteria
- **WHEN** the user taps the claim button
- **THEN** the system initiates a reward transfer without requiring sats balance for claim preconditions

#### Scenario: Successful blinded campaign claim
- **GIVEN** the coin has an active blinded campaign, the user meets eligibility criteria, and the user has sufficient sats for claim prerequisites
- **WHEN** the user taps the claim button
- **THEN** the system initiates a reward transfer

#### Scenario: Insufficient sats for blinded campaign
- **GIVEN** the campaign type is blinded and the user has insufficient sats
- **WHEN** the user attempts to claim
- **THEN** the system instructs the user to add Bitcoin to the wallet