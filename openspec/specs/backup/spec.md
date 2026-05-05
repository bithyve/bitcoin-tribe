# Backup Specification

## Purpose
The backup domain is responsible for protecting the user's wallet seed phrase and RGB asset data against device loss. It provides a guided two-step process: first securing the seed phrase, then backing up asset state to an external destination. Backup status, history, and health-check functionality are surfaced through dedicated screens.

---

## Requirements

### Requirement: Backup Menu
The system MUST display a backup menu that shows the current completion status of each backup step and guides the user through the full backup process.

#### Scenario: Viewing backup status when neither step is complete
- GIVEN the user has a wallet with a seed phrase
- WHEN the user opens the backup menu
- THEN the system MUST display Step 1 (seed phrase backup) and, WHEN appType is `ON_CHAIN`, Step 2 (asset backup) as incomplete
- AND an informational hint MUST be shown beneath each incomplete step

#### Scenario: Viewing backup status after both steps are completed
- GIVEN the user has completed both Step 1 and Step 2
- WHEN the user opens the backup menu
- THEN the system MUST display both steps as complete with a success indicator

---

### Requirement: Seed Phrase Backup
The system MUST allow the user to view and confirm their wallet seed phrase as the first step of the backup flow.

#### Scenario: Initiating seed backup without a custom PIN method
- GIVEN the user has not configured a custom PIN method
- WHEN the user selects the wallet backup option
- THEN the system MUST navigate directly to the seed phrase screen displaying the complete seed phrase

#### Scenario: Initiating seed backup with a custom PIN method
- GIVEN the user has configured a custom PIN method
- WHEN the user selects the wallet backup option
- THEN the system MUST display a PIN verification prompt before revealing the seed phrase
- AND the seed phrase screen MUST only appear after the correct PIN is entered

#### Scenario: Incorrect PIN during seed backup access
- GIVEN the user has a custom PIN method configured
- WHEN the user enters an incorrect PIN in the verification prompt
- THEN the system MUST reject the attempt and display an invalid PIN error message

#### Scenario: Confirming the seed phrase
- GIVEN the seed phrase screen is displayed
- WHEN the user chooses to confirm the backup
- THEN the system MUST mark Step 1 as complete and navigate to the backup history screen
- AND a confirmation toast MUST be shown

#### Scenario: Skipping seed phrase confirmation
- GIVEN the seed phrase screen is displayed
- WHEN the user chooses to skip confirmation
- THEN the system MUST still record a backup event and navigate to the backup history screen
- AND a skip notification toast MUST be shown

---

### Requirement: RGB Asset Backup via Relay
WHEN appType is `ON_CHAIN`, the system MUST allow the user to export an asset backup file and upload it to a relay server as Step 2 of the backup flow.

#### Scenario: Performing asset backup when Step 1 is not yet complete
- GIVEN the user has not completed Step 1
- WHEN the user attempts to initiate Step 2
- THEN the system MUST block the action and display an error toast indicating Step 1 must be done first

#### Scenario: Performing a successful asset backup
- GIVEN Step 1 is complete and the wallet is online
- WHEN the user selects the asset backup option
- THEN the system MUST generate a backup file and present the OS share sheet
- AND upon successful share, the system MUST mark Step 2 as complete
- AND the backup file MUST also be uploaded to the relay server
- AND the relay backup timestamp displayed on the backup menu MUST be updated

#### Scenario: Asset backup when wallet is not online
- GIVEN the wallet is in an error or connecting state
- WHEN the user views the backup menu
- THEN the asset backup option MUST be disabled

#### Scenario: Relay backup timestamp display
- GIVEN the backup menu is open
- THEN the system MUST display the date and time of the most recent successful relay backup
- AND WHEN no relay backup has been performed, the system MUST show "Never"

---

### Requirement: Cloud Backup of RGB Assets
The system MUST allow the user to back up RGB asset data to platform cloud storage and view the history of previous cloud backups.

#### Scenario: Triggering a cloud backup
- GIVEN the user is on the cloud backup screen
- WHEN the user initiates a backup
- THEN the system MUST display an in-progress indicator
- AND upon success, MUST record the event in cloud backup history and show a success toast
- AND the cloud storage destination MUST be iCloud on iOS and Google Drive on Android

#### Scenario: Cloud backup failure
- GIVEN the user initiates a cloud backup
- WHEN the backup operation fails
- THEN the system MUST display a failure toast

#### Scenario: Viewing cloud backup history
- GIVEN one or more cloud backups have been performed
- WHEN the user opens the cloud backup screen
- THEN the system MUST display a chronological list of past backup events

#### Scenario: No cloud backup history
- GIVEN no cloud backup has ever been performed
- WHEN the user opens the cloud backup screen
- THEN the system MUST display an empty-state illustration with no history items

---

### Requirement: Backup History
The system MUST maintain a history of seed phrase backup events and display them to the user.

#### Scenario: Viewing backup history
- GIVEN one or more seed phrase backup events have been recorded
- WHEN the user opens the backup history screen
- THEN the system MUST display a chronological list of backup events, each with a date and confirmation status

---

### Requirement: Seed Phrase Health Check
The system MUST allow the user to re-verify their seed phrase from the backup history screen to confirm they still have access to it.

#### Scenario: Performing a health check
- GIVEN the user is on the backup history screen
- WHEN the user initiates a health check
- THEN the system MUST present the seed phrase confirmation flow
- AND upon successful confirmation, MUST update the backup record and show a success toast

---

### Requirement: Backup Phrase Settings
The system MUST allow the user to view their seed phrase in read-only mode from the backup settings screen.

#### Scenario: Viewing seed phrase in read-only mode without custom PIN
- GIVEN the user has not configured a custom PIN method
- WHEN the user selects the view backup phrase option
- THEN the system MUST navigate directly to the seed phrase screen in view-only mode

#### Scenario: Viewing seed phrase in read-only mode with custom PIN
- GIVEN the user has a custom PIN method configured
- WHEN the user selects the view backup phrase option
- THEN the system MUST display a PIN verification prompt
- AND ONLY after correct PIN entry MUST the seed phrase be displayed in view-only mode
- AND no confirmation actions MUST be available in view-only mode
