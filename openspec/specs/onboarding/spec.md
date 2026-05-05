# Onboarding Specification

## Purpose
This domain covers the complete first-run experience and subsequent app unlock: introductory
slides, wallet type selection, wallet creation, seed-phrase and backup-file recovery, profile
setup, PIN/biometric creation, and the login screen shown on every cold start. It establishes
which `appType` (`ON_CHAIN`, `NODE_CONNECT`, or `SUPPORTED_RLN`) the user's app instance
operates under for the rest of its lifecycle.

---

## Requirements

### Requirement: Introductory Slides
The system MUST present a multi-slide carousel on first launch that explains key app concepts
before directing the user to wallet setup.

#### Scenario: User advances through all slides
- GIVEN the app is launched for the first time
- WHEN the onboarding slides screen is shown
- THEN the user sees at least two informational slides (e.g., BTC-backed assets, backup
  importance) with a page indicator reflecting the current position
- AND a single call-to-action button advances them to wallet setup after the slides

---

### Requirement: Wallet Setup Entry
The system MUST offer the user two distinct entry paths: creating a new wallet or recovering
an existing wallet from a seed phrase.

#### Scenario: User chooses to create a new wallet
- GIVEN the user is on the wallet setup options screen
- WHEN they select "Create New Wallet"
- THEN the system navigates them toward wallet type selection (or directly to profile setup
  in production builds locked to mainnet)

#### Scenario: User chooses to recover from seed phrase
- GIVEN the user is on the wallet setup options screen
- WHEN they select "Recovery Phrase"
- THEN the system navigates them to the seed phrase entry screen

---

### Requirement: Wallet Type Selection (Production)
In production builds, the system MUST create an `ON_CHAIN` app instance and proceed directly
to profile setup. No wallet type selection screen is shown.

#### Scenario: New wallet created in production
- GIVEN the user is on the wallet setup options screen in a production build
- WHEN they select "Create New Wallet"
- THEN the system navigates directly to profile setup with `appType` `ON_CHAIN`

---

### Requirement: Wallet Type Selection (Non-Production)
In non-production builds, the system MUST allow the user to select between an on-chain-only
wallet and advanced Lightning / RGB modes. Advanced options MUST be explicitly expanded by
the user and are hidden by default.

#### Scenario: User selects on-chain (Mainnet)
- GIVEN the wallet type selection screen is visible in a non-production build
- WHEN the user taps the Mainnet option
- THEN the system creates an `ON_CHAIN` app instance and navigates to profile setup

#### Scenario: User selects Mainnet + Lightning (NODE_CONNECT)
- GIVEN the user has expanded advanced options
- WHEN they select the Mainnet + Lightning option
- THEN the system navigates to the node connection screen so the user can supply their own
  RGB Lightning node details
- AND the resulting app instance uses `appType` `NODE_CONNECT`

#### Scenario: User selects Supported node (SUPPORTED_RLN)
- GIVEN the user has expanded advanced options and selected the Supported option
- WHEN the user accepts the terms and conditions and taps Proceed
- THEN the system provisions a managed RGB Lightning node
- AND navigates to profile setup with `appType` `SUPPORTED_RLN`
- AND if node provisioning fails, an error message is displayed and the user remains on the
  selection screen

#### Scenario: User attempts to proceed with Supported mode without accepting terms
- GIVEN the user has selected the Supported option
- WHEN the terms and conditions checkbox is not checked
- THEN the Proceed button MUST remain disabled

---

### Requirement: Learn More Pages
In non-production builds, the system MUST provide informational detail pages for each wallet
type, accessible from the wallet type selection screen, so users can make an informed choice
before committing.

#### Scenario: User opens Learn More for any wallet type
- GIVEN the wallet type selection screen is visible
- WHEN the user taps the "Learn more" link next to any wallet type
- THEN a read-only informational screen is shown describing that mode's capabilities and
  trade-offs
- AND the user can navigate back to wallet type selection without losing their prior state

---

### Requirement: Supported Mode Terms and Conditions
In non-production builds, WHEN `appType` is `SUPPORTED_RLN`, the system MUST present a terms
and conditions screen that the user must explicitly accept before a managed node is provisioned.

#### Scenario: User reads and accepts terms
- GIVEN the terms and conditions screen is shown
- WHEN the user checks the acceptance checkbox
- THEN the Proceed button becomes enabled
- AND tapping Proceed triggers node provisioning

---

### Requirement: RGB Lightning Node Connection
In non-production builds, WHEN `appType` is `NODE_CONNECT`, the system MUST allow the user
to connect to a self-hosted RGB Lightning node by providing the node URL and authentication
credentials. It MUST verify the connection before proceeding.

#### Scenario: Successful node connection with bearer token
- GIVEN the node connection screen is shown
- WHEN the user enters a valid node URL and a bearer token and taps Connect
- THEN the system verifies the node is reachable and returns a valid public key
- AND a success confirmation is displayed briefly
- AND the user is forwarded to profile setup with the node parameters retained

#### Scenario: Successful node connection with basic auth
- GIVEN the node connection screen is shown
- WHEN the user selects Basic auth, enters username/password, and taps Connect
- THEN the system constructs the correct Base64-encoded authorization header internally
- AND connection verification proceeds identically to the bearer token path

#### Scenario: Node connection fails
- GIVEN the user enters incorrect or unreachable node details
- WHEN the connection attempt is made
- THEN the system displays an error message
- AND the user remains on the node connection screen with their previously entered values intact

---

### Requirement: Seed Phrase Recovery
The system MUST allow the user to restore a wallet by entering a valid 12-word BIP39 mnemonic.
Each word MUST be validated individually against the BIP39 English wordlist, and the complete
phrase MUST be validated before a restoration attempt is made.

#### Scenario: Successful restore from mnemonic
- GIVEN the seed entry screen is shown
- WHEN the user enters all 12 valid BIP39 words and taps Next
- THEN the system attempts to restore the wallet from the mnemonic
- AND on success navigates the user to the main app interface with a confirmation toast

#### Scenario: Mnemonic is invalid
- GIVEN the user has entered all 12 words
- WHEN one or more words are not in the BIP39 wordlist
- THEN the invalid words are visually highlighted
- AND the system displays an error toast and does not attempt a restore

#### Scenario: Mnemonic valid but no backup found — user chooses to import backup
- GIVEN the user enters a valid 12-word mnemonic
- WHEN the restoration attempt finds no existing backup for that seed
- THEN the system presents a confirmation dialog asking whether the user wants to recover
  their RGB asset state
- AND if the user confirms, the system navigates to the RGB backup file import screen with
  the mnemonic retained

#### Scenario: Mnemonic valid but no backup found — user skips import and starts fresh
- GIVEN the system is showing the "recover RGB state" confirmation dialog
- WHEN the user declines
- THEN the system creates a new `ON_CHAIN` wallet using that mnemonic without importing
  any backup file
- AND the user is taken to the main app interface

#### Scenario: Word suggestion
- GIVEN the user is typing a seed word
- WHEN at least two characters have been entered
- THEN the system shows a list of matching BIP39 words as autocomplete suggestions

---

### Requirement: RGB Backup File Import
WHEN a valid mnemonic is present, no server backup is found, and the user has chosen to
recover their RGB state, the system MUST allow the user to import a `.rgb_backup` file from
device storage to complete recovery.

#### Scenario: Successful RGB backup import
- GIVEN the RGB backup import screen is shown with a valid mnemonic pre-loaded
- WHEN the user selects a valid `.rgb_backup` file
- THEN the system restores the wallet using the file and navigates to the main app

#### Scenario: Invalid backup file selected
- GIVEN the RGB backup import screen is shown
- WHEN the user selects a file that is not a `.rgb_backup` file
- THEN the system displays an error toast and remains on the import screen

---

### Requirement: Profile Setup
The system MUST require the user to provide a display name before completing wallet
initialization. A profile photo is optional.

#### Scenario: Profile created successfully with name only
- GIVEN the profile setup screen is shown
- WHEN the user enters a name of at least 3 characters and taps Save
- THEN the system initializes the wallet in the background, showing a progress indicator
- AND on completion navigates to the onboarding slides screen which leads to the main app

#### Scenario: Save button disabled for short name
- GIVEN the profile setup screen is shown
- WHEN the name field contains fewer than 3 characters
- THEN the Save button MUST remain disabled

#### Scenario: Profile created with optional photo
- GIVEN the profile setup screen is shown
- WHEN the user picks a photo from the device gallery and enters a valid name before tapping Save
- THEN the profile image is included in wallet initialization

#### Scenario: Initialization failure
- GIVEN the profile setup screen is shown and the user taps Save
- WHEN wallet initialization fails
- THEN the system dismisses the progress indicator and displays an error toast
- AND the user remains on the profile setup screen with their entered data intact

---

### Requirement: PIN Creation
The system MUST require the user to create a 4-digit numeric PIN. The user MUST enter the PIN
twice and the two entries MUST match before the PIN is accepted.

#### Scenario: PIN created successfully
- GIVEN the PIN creation screen is shown
- WHEN the user enters a 4-digit PIN and then enters the same PIN again as confirmation
- THEN the PIN is saved and the user progresses to the next step

#### Scenario: PIN confirmation mismatch
- GIVEN the user has entered a 4-digit PIN for the first time
- WHEN the confirmation PIN differs from the original PIN
- THEN the system displays a mismatch error toast
- AND clears the confirmation entry so the user can try again

---

### Requirement: App Login (PIN and Biometric)
The system MUST authenticate the user with their PIN on every cold start. If biometric
authentication was configured during setup, the system SHOULD automatically prompt for
biometric authentication before falling back to PIN entry.

#### Scenario: Biometric login succeeds
- GIVEN the login screen is shown and the user has biometric authentication enabled
- WHEN biometric authentication succeeds automatically on screen load
- THEN the user is taken directly to the main app without entering a PIN

#### Scenario: User cancels biometric and enters PIN
- GIVEN the biometric prompt is shown
- WHEN the user dismisses it (e.g., taps "Use PIN")
- THEN the PIN entry keypad is available and the user can authenticate with their PIN

#### Scenario: Correct PIN entered
- GIVEN the login screen is showing PIN entry
- WHEN the user enters the correct 4-digit PIN
- THEN the app is unlocked and the user is taken to the main app interface

#### Scenario: Incorrect PIN entered
- GIVEN the login screen is showing PIN entry
- WHEN the user enters an incorrect PIN
- THEN the system displays an invalid PIN error toast
- AND clears the PIN entry field so the user can attempt again
