## MODIFIED Requirements

### Requirement: Seed Phrase Backup
The system MUST allow the user to view and confirm their wallet seed phrase as the first step of the backup flow.

#### Scenario: Confirming the seed phrase with random word verification
- **GIVEN** the seed phrase screen is displayed
- **WHEN** the user chooses to confirm the backup
- **THEN** the system asks the user to enter one randomly selected mnemonic word from the phrase
- **AND** only after the entered word matches, the system marks Step 1 as complete and navigates to backup history
- **AND** a confirmation toast is shown

#### Scenario: Incorrect random word during confirmation
- **GIVEN** the random mnemonic word confirmation prompt is shown
- **WHEN** the user enters an incorrect word
- **THEN** the system rejects confirmation and displays an error message
- **AND** Step 1 remains incomplete

### Requirement: RGB Asset Backup via Relay
WHEN appType is `ON_CHAIN`, the system MUST allow the user to create an encrypted RGB asset backup and MUST automatically upload it to a relay server as Step 2 of the backup flow.

#### Scenario: Performing a successful asset backup
- **GIVEN** Step 1 is complete and the wallet is online
- **WHEN** the user selects the asset backup option
- **THEN** the system generates an encrypted backup payload
- **AND** uploads the encrypted payload to the relay server automatically
- **AND** marks Step 2 as complete
- **AND** updates relay backup metadata in application state, including the latest successful backup timestamp

## REMOVED Requirements

### Requirement: Cloud Backup of RGB Assets
**Reason**: Cloud backup of RGB assets is no longer a supported feature.
**Migration**: Use relay-backed encrypted RGB asset backup as the only supported Step 2 path.