# Security Specification

## Purpose
The security domain is responsible for protecting access to the app and the sensitive data it holds. It governs how the user authenticates to unlock the app, how the PIN is created and changed, and how the wallet seed phrase and all persisted data are kept confidential. Security requirements apply universally across all appTypes.

---

## Requirements

### Requirement: App Lock on Every Launch
The system MUST require the user to authenticate before accessing any wallet functionality after each cold start of the app.

#### Scenario: Launching the app
- GIVEN the app has been set up with a wallet
- WHEN the app is opened from a cold start
- THEN the system MUST present the authentication screen before any wallet data is visible

---

### Requirement: PIN-Based Authentication
The system MUST support a 4-digit numeric PIN as an authentication method to unlock the app.

#### Scenario: Successful PIN login
- GIVEN the user has configured a 4-digit PIN
- WHEN the user enters the correct 4-digit PIN on the login screen and confirms
- THEN the system MUST unlock the app and navigate the user to the main screen

#### Scenario: Incorrect PIN entry
- GIVEN the user has configured a 4-digit PIN
- WHEN the user enters an incorrect PIN and confirms
- THEN the system MUST reject the attempt, display an invalid PIN error, and clear the input field

#### Scenario: PIN input length enforcement
- GIVEN the login screen is displayed
- WHEN the user has entered fewer than 4 digits
- THEN the proceed action MUST remain disabled until exactly 4 digits are entered

---

### Requirement: Biometric Authentication
The system MUST support device biometrics (fingerprint or face recognition) as an alternative authentication method WHEN the user has enabled it.

#### Scenario: Biometric prompt on launch
- GIVEN the user has configured biometric authentication
- WHEN the app is opened
- THEN the system MUST automatically prompt the biometric authentication dialog

#### Scenario: Successful biometric login
- GIVEN the biometric prompt is displayed
- WHEN the user authenticates successfully via biometrics
- THEN the system MUST unlock the app and navigate to the main screen

#### Scenario: Biometric failure or cancellation
- GIVEN the biometric prompt is displayed
- WHEN the user cancels or biometric verification fails
- THEN the system MUST display an error toast and fall back to the PIN entry screen

---

### Requirement: Default (No-PIN) Authentication Mode
The system MUST support a default authentication mode where no PIN is required and the app unlocks automatically on launch.

#### Scenario: Auto-login in default mode
- GIVEN the user has not configured a PIN or biometric method
- WHEN the app is opened
- THEN the system MUST unlock and navigate to the main screen without prompting for credentials

---

### Requirement: PIN Creation
The system MUST allow the user to create a 4-digit PIN during onboarding or when setting up an additional authentication method.

#### Scenario: Creating a PIN successfully
- GIVEN the user is on the set passcode screen
- WHEN the user enters a 4-digit PIN and confirms it with the same 4 digits
- THEN the system MUST save the PIN and display a modal reminding the user to remember their passcode

#### Scenario: PIN and confirmation do not match
- GIVEN the user has entered a 4-digit PIN
- WHEN the user enters a different value in the confirmation field
- THEN the system MUST display a mismatch error toast and the proceed action MUST remain disabled

#### Scenario: PIN creation error
- GIVEN the user attempts to create a PIN
- WHEN an unexpected error occurs during PIN creation
- THEN the system MUST display an error toast and not update the authentication method

---

### Requirement: PIN Change
The system MUST allow an authenticated user to change their PIN to a new 4-digit value.

#### Scenario: Changing PIN successfully
- GIVEN the user is authenticated and navigates to the change passcode screen
- WHEN the user enters a new 4-digit PIN and confirms it with the same value
- THEN the system MUST update the PIN, display a success toast, and return to the previous screen

#### Scenario: New PIN and confirmation do not match during change
- GIVEN the user is on the change passcode screen
- WHEN the user enters a new PIN and a different confirmation value
- THEN the system MUST display a mismatch error toast and keep the proceed action disabled

#### Scenario: Removing PIN (reverting to default)
- GIVEN the user is on the change passcode screen
- WHEN the user leaves both passcode fields empty and confirms
- THEN the system MUST remove the PIN requirement and revert the authentication method to the default (no-PIN) mode

---

### Requirement: Encrypted Data Storage
The system MUST encrypt all persisted app data at rest using the user's authentication credentials as the basis for the encryption key.

#### Scenario: Data inaccessible without correct credentials
- GIVEN the app data is stored on the device
- WHEN an attempt is made to access the data without valid credentials (wrong PIN or no key)
- THEN the system MUST fail to open the data store and no wallet data MUST be accessible

#### Scenario: Data accessible after successful authentication
- GIVEN the user provides correct authentication credentials
- WHEN the app unlocks
- THEN the system MUST derive the encryption key from the credentials and open the data store successfully

---

### Requirement: Seed Phrase Confidentiality
The system MUST store the wallet seed phrase only within the encrypted data store and MUST NOT expose it in plain text outside of explicit user-initiated backup flows.

#### Scenario: Seed phrase protected at rest
- GIVEN a wallet has been set up
- WHEN the device is at rest and the app is locked
- THEN the seed phrase MUST be inaccessible without successful authentication

#### Scenario: Seed phrase access requires authentication
- GIVEN the app is unlocked
- WHEN the user navigates to view or back up the seed phrase
- THEN the system MUST require PIN verification (or re-authentication when a custom PIN method is configured) before displaying the seed phrase
