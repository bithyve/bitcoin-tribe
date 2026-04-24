# Feature Specification: Onboarding Flow

**Feature Branch**: `feat/onboarding-flow` (implemented on `main`/`sprint`)
**Created**: 2026-04-24
**Status**: migrated
**Input**: Reverse-engineered from `src/screens/onBoarding/`, `src/services/wallets/`, `src/services/handler/apiHandler.ts`

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Wallet Setup (On-chain only) (Priority: P1)

A first-time user opens the app, views onboarding slides, chooses "Create New Wallet", picks the Bitcoin network (mainnet in production, testnet4/regtest in dev), sets a profile name and optional picture, sets a 4-digit passcode (or opts for biometric), and lands on the home screen with a freshly generated BIP39 wallet.

**Why this priority**: Core happy path. Without it the app cannot be used at all.

**Independent Test**: Fresh install on a simulator → complete create-new flow → verify home screen is reached and wallet record exists in Realm.

**Acceptance Scenarios**:

1. **Given** the app is freshly installed, **When** the user opens it, **Then** `OnboardingSlides` is shown with BTC-backed asset and backup-alert slides.
2. **Given** the user is on `WalletSetupOption`, **When** they tap "Create New Wallet", **Then** they navigate to `ProfileSetup` (production) or `SelectWallet` (dev).
3. **Given** the user is on `ProfileSetup`, **When** they submit a name and optional image, **Then** `ApiHandler.setupNewApp` is called with `appType: AppType.ON_CHAIN`, a freshly generated BIP39 mnemonic is stored in Realm, the AES encryption key is stored in Keychain, and the user navigates to `APPSTACK`.
4. **Given** `setupNewApp` succeeds, **When** a 4-digit passcode is set, **Then** `ApiHandler.createPin` re-encrypts the AES key under a hash of that PIN and persists `Keys.PIN_METHOD = PIN` in MMKV.
5. **Given** production environment, **When** the user reaches `WalletSetupOption`, **Then** network selection is skipped and `NetworkType.MAINNET` is set automatically.

---

### User Story 2 — Wallet Recovery via Seed Phrase (Priority: P1)

A returning user chooses "Recovery Phrase" on `WalletSetupOption`, enters all 12/24 BIP39 seed words with inline word suggestion, and the app restores the wallet from a relay backup or RGB backup file, then navigates to the home screen.

**Why this priority**: Equally critical as creation — users need to recover on a new device.

**Independent Test**: Enter a known 12-word mnemonic → verify `ApiHandler.restoreApp` is called → verify `APPSTACK` navigation.

**Acceptance Scenarios**:

1. **Given** the user is on `EnterSeedScreen`, **When** they type seed words, **Then** autocomplete suggestions from the BIP39 word list are shown below each input.
2. **Given** all 24/12 words are filled with valid BIP39 words, **When** the user taps Recover, **Then** `ApiHandler.restoreApp(mnemonic)` is called.
3. **Given** a relay backup exists for the mnemonic, **When** restore succeeds, **Then** `ApiHandler.setupNewApp` is called with restored parameters and the app navigates to `APPSTACK`.
4. **Given** a relay backup with a backup file exists, **When** restore succeeds, **Then** `RGBServices.restore`, `ApiHandler.refreshRgbWallet`, and `ApiHandler.fetchPresetAssets` are called before navigating.
5. **Given** no relay backup exists, **When** restore fails, **Then** an error toast is shown and the user remains on `EnterSeedScreen`.
6. **Given** a partially entered or invalid BIP39 word, **When** the user attempts to proceed, **Then** invalid words are highlighted and the action is disabled.

---

### User Story 3 — RGB Lightning Node Connect (Priority: P2)

A power user selects "Connect RGB Lightning Node" in `SelectWallet`, enters a node URL with optional Bearer or Basic authentication credentials, verifies the connection, and completes profile setup to land on the home screen with `AppType.NODE_CONNECT`.

**Why this priority**: Advanced flow; app is fully usable without it.

**Independent Test**: Enter a valid RGB node URL → verify `ApiHandler.checkRgbNodeConnection` is called → verify navigation to `ProfileSetup` with `nodeConnectParams`.

**Acceptance Scenarios**:

1. **Given** the user is on `RgbLightningNodeConnect`, **When** they paste a node URL, **Then** the node ID field is auto-extracted from the URL path.
2. **Given** the user selects "Bearer" auth type, **When** they enter a token and tap Connect, **Then** `ApiHandler.checkRgbNodeConnection` is called with the constructed bearer header.
3. **Given** the connection check returns a valid `pubkey`, **When** the success popup appears, **Then** after 3 seconds the user is navigated to `ProfileSetup` with `appType: AppType.NODE_CONNECT` and node info.
4. **Given** the connection check fails or returns an error, **When** the response is received, **Then** an error toast is shown and the user stays on the connect screen.

---

### User Story 4 — Returning User Login (Priority: P1)

A user who has already set up the app relaunches it and authenticates via PIN or biometrics.

**Why this priority**: Required for every app session after first launch.

**Independent Test**: Kill/relaunch app on a set-up device → verify PIN entry or Face ID/Fingerprint prompt is shown.

**Acceptance Scenarios**:

1. **Given** `Keys.PIN_METHOD` is `BIOMETRIC`, **When** `Login` mounts, **Then** the biometric prompt is shown automatically via `ReactNativeBiometrics`.
2. **Given** biometric succeeds, **When** `ApiHandler.biometricLogin` resolves, **Then** the AES key is restored from Keychain, Realm is initialised, and `APPSTACK` is navigated to.
3. **Given** `Keys.PIN_METHOD` is `PIN`, **When** the user enters 4 digits, **Then** `ApiHandler.loginWithPin` is called.
4. **Given** a wrong PIN, **When** login fails, **Then** "Invalid PIN" toast is shown and the input is cleared.
5. **Given** biometric is unavailable or fails, **When** the error occurs, **Then** the user can fall back to PIN entry.

---

### User Story 5 — RGB Backup File Restore (Priority: P2)

A user selects "Import RGB Backup" and picks a `.rgb_backup` file from their device, restoring the full RGB state.

**Why this priority**: Recovery path for users with local backup files only.

**Independent Test**: Present a valid `.rgb_backup` file → verify `ApiHandler.restoreWithBackupFile` is called → verify `APPSTACK` navigation.

**Acceptance Scenarios**:

1. **Given** the user is on `ImportRgbBackup`, **When** they tap the import button, **Then** the document picker opens (cross-platform: iOS and Android).
2. **Given** a valid `.rgb_backup` file is selected, **When** `ApiHandler.restoreWithBackupFile` resolves, **Then** `logCustomEvent(events.APP_RECOVERED)` is fired and the user navigates to `APPSTACK`.
3. **Given** the backup file is invalid or restore fails, **When** the error occurs, **Then** `"Failed to restore <error>"` toast is shown and the loader is dismissed.

---

### User Story 6 — Change/Remove PIN (Priority: P3)

An already-authenticated user navigates to `ChangePin` (accessible from Settings) and updates or removes their 4-digit passcode.

**Why this priority**: Convenience/security feature; non-critical for initial use.

**Independent Test**: From settings, open ChangePin → submit new 4-digit code → verify `ApiHandler.changePin` is called with the new hash.

**Acceptance Scenarios**:

1. **Given** the user is on `ChangePin`, **When** they leave the passcode field empty and confirm, **Then** `ApiHandler.changePin` is called with `pin: ''` and `Keys.PIN_METHOD` is set to `DEFAULT`.
2. **Given** the user enters a new 4-digit PIN, **When** they confirm, **Then** `ApiHandler.changePin` stores the re-encrypted key under the new PIN hash.

---

### Edge Cases

- What happens when the device is offline during `setupNewApp`? (Relay challenge fails → error toast shown, app does not proceed)
- How does the system handle a corrupted Keychain entry? (`loginWithPin` throws `'Invalid PIN'` — no retry limit currently enforced)
- What if biometric sensor is unavailable at time of login? (Falls back silently to PIN input)
- What if the BIP39 mnemonic entered has invalid words? (Words marked invalid inline; proceed CTA disabled)
- What if the user navigates back mid-onboarding before `setupNewApp` completes? (Partially initialised state — no cleanup mechanism detected; see Gaps)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a fresh BIP39 mnemonic on new wallet creation and store it in Realm (`TribeApp.primaryMnemonic`)
- **FR-002**: System MUST derive and store an AES encryption key in react-native-keychain (never in Realm or MMKV) before initialising Realm
- **FR-003**: System MUST support three wallet/app types: `ON_CHAIN`, `NODE_CONNECT`, `SUPPORTED_RLN`
- **FR-004**: System MUST allow PIN-based and biometric-based authentication; PIN method MUST be persisted in MMKV under `Keys.PIN_METHOD`
- **FR-005**: System MUST validate all 12/24 BIP39 seed words against the BIP39 word list before allowing restore
- **FR-006**: System MUST request Firebase Messaging notification permission during `SelectWallet` (Android 13+ requires explicit runtime permission)
- **FR-007**: System MUST auto-set `NetworkType.MAINNET` in production builds; dev builds MUST allow testnet4 or regtest selection
- **FR-008**: System MUST log analytics event `events.APP_RECOVERED` on successful restore (seed or backup file)
- **FR-009**: System MUST support importing a `.rgb_backup` file via the platform document picker on both iOS and Android
- **FR-010**: System MUST navigate to `APPSTACK` after all successful onboarding paths

### Key Entities

- **TribeApp** (`src/storage/realm/schema/app.ts`): Top-level app record — `id`, `publicId`, `appName`, `walletImage`, `primaryMnemonic`, `primarySeed`, `networkType`, `version`, `appType`, `authToken`
- **Wallet** (`src/storage/realm/schema/wallet.ts`): Bitcoin wallet record with `WalletSpecs`, derivation paths, UTXO cache, address cache
- **AES Encryption Key**: Not in Realm — stored encrypted in react-native-keychain, keyed by `hash512(PIN)` or `hash512(ENC_KEY_STORAGE_IDENTIFIER)` for default/biometric

---

## Screen Design *(mandatory)*

### Screens / Modals

| Screen | Path | Purpose |
|--------|------|---------|
| OnboardingSlides | `src/screens/onBoarding/OnboardingSlides.tsx` | Welcome/feature highlight carousel (2 slides) |
| WalletSetupOption | `src/screens/onBoarding/WalletSetupOption.tsx` | Choose: Create New or Recovery Phrase |
| SelectWallet | `src/screens/onBoarding/SelectWallet.tsx` | Choose wallet type (On-chain, Lightning Node, Supported RLN); requests notification permission |
| ProfileSetup | `src/screens/onBoarding/ProfileSetup.tsx` | Enter name + optional profile image; triggers `setupNewApp` |
| CreatePin | `src/screens/onBoarding/CreatePin.tsx` | Set 4-digit passcode (enter + confirm) |
| Login | `src/screens/onBoarding/Login.tsx` | Re-entry point for existing users — PIN or biometric |
| EnterSeedScreen | `src/screens/onBoarding/EnterSeedScreen.tsx` | 24-word BIP39 seed entry with autocomplete |
| RgbLightningNodeConnect | `src/screens/onBoarding/RgbLightningNodeConnect.tsx` | RGB node URL + auth entry; tests connection |
| ImportRgbBackup | `src/screens/onBoarding/ImportRgbBackup.tsx` | Document picker for `.rgb_backup` restore |
| ChangePin | `src/screens/onBoarding/ChangePin.tsx` | Update or remove existing PIN (accessible from Settings) |
| SupportTermAndCondition | `src/screens/onBoarding/SupportTermAndCondition.tsx` | Terms & conditions (shown for supported RLN path) |
| LNLearnMore / OnchainLearnMore / SupportLearnMore | `src/screens/onBoarding/` | Informational learn-more screens |

### Navigation

- Entry: `LOGINSTACK` root — app checks MMKV `Keys.SETUPAPP`; if false → `ONBOARDINGSCREEN` (slides); if true → `Login`
- Routes used: `ONBOARDINGSCREEN`, `WALLETSETUPOPTION`, `SELECTWALLET`, `PROFILESETUP`, `CREATEPIN`, `ENTERSEEDSCREEN`, `RGBLIGHTNINGNODECONNECT`, `IMPORTRGBBACKUP`, `CHANGEPIN`, `SUPPORTTERMANDCONDITION`, `LNLEARNMORE`
- Exit: All successful paths navigate to `NavigationRoutes.APPSTACK` via `navigation.replace`

### UI State

- Loading state: `InProgessPopupContainer` modal overlay during `setupNewApp` / `restoreApp` / `restoreWithBackupFile`
- Error state: `Toast` component (bottom flash message, error variant)
- Success state: `ResponsePopupContainer` popup (e.g., node connected, pin set) with auto-dismiss

---

## Service Layer *(mandatory)*

- **Modified service**: `src/services/handler/apiHandler.ts`
  - `setupNewApp({appName, pinMethod, passcode, walletImage, mnemonic, appType, rgbNodeConnectParams, rgbNodeInfo, authToken, isRestore})` — orchestrates Realm init, key generation, wallet derivation, relay registration
  - `restoreApp(mnemonic)` — fetches relay backup, delegates to `setupNewApp` or `RGBServices.restore`
  - `restoreWithBackupFile({...})` — restores from local `.rgb_backup` file
  - `createPin(pin)` — re-encrypts AES key under new PIN hash
  - `changePin({key, pin})` — updates keychain entry for new PIN
  - `loginWithPin(pin)` — decrypts AES key, inits Realm, returns key
  - `biometricLogin(signature)` — verifies biometric signature, returns key
  - `checkRgbNodeConnection(params)` — tests RGB node connectivity, returns node pubkey/info
- **External calls**:
  - `Relay.getChallenge(appID, publicKey)` — GET relay challenge for new wallet registration
  - `Relay.getBackup(publicId)` — GET relay backup on restore
  - Firebase Messaging permission request (iOS + Android 13+)
- **Error handling**: All mutations surface errors via `Toast` component; `isError` / `isSuccess` watched via `useEffect` on react-query mutation state

---

## Storage Requirements *(mandatory)*

### Realm Schema Changes

- **`TribeApp`** (`src/storage/realm/schema/app.ts`): Top-level singleton — created once during `setupNewApp`; no migration since first install
- **`Wallet`** (`src/storage/realm/schema/wallet.ts`): Bitcoin wallet with full UTXO/address cache schema — created during `setupNewApp`
- Migration required: No (schema established at first launch; no mid-onboarding migration path)

### Secure Storage (react-native-keychain via `src/storage/secure-store.ts`)

- `hash512(ENC_KEY_STORAGE_IDENTIFIER)` → encrypted AES key (default / biometric auth mode)
- `hash512(PIN)` → encrypted AES key (PIN auth mode)
- `biometricAuthKey` → biometric public key registration (set during `CreatePin` with biometric option)

---

## Platform Considerations *(mandatory)*

- **iOS-specific**: Biometric uses Face ID / Touch ID via `react-native-biometrics`; camera permission required for profile image picker; navigation timing after biometric login uses 1000 ms delay vs 300 ms on Android
- **Android-specific**: `POST_NOTIFICATIONS` runtime permission required on Android 13+ (API 33); requested during `SelectWallet`
- **Dev vs Production**: Network type selection (testnet4/regtest) is shown only in dev builds (`config.ENVIRONMENT !== APP_STAGE.PRODUCTION`); production auto-sets mainnet
- **Permissions**: Camera + Photo Library (profile image picker via `react-native-image-crop-picker`); Notifications (Firebase Messaging)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete the full create-new-wallet flow (slides → setup option → profile → pin → home) in under 3 minutes
- **SC-002**: A returning user with PIN or biometrics can authenticate and reach the home screen in under 10 seconds
- **SC-003**: Seed phrase restore succeeds for any valid 12 or 24-word BIP39 mnemonic that has a relay backup
- **SC-004**: Backup file restore succeeds for any valid `.rgb_backup` file on both iOS and Android
- **SC-005**: No private key, mnemonic, or passcode is written to Realm, MMKV, or application logs

---

## Assumptions

- The relay server is available during initial wallet setup; offline-first new wallet creation is not supported
- Profile image is optional; the app proceeds without one
- Biometric enrollment is assumed to be done at the OS level before app launch; the app does not guide users to enroll
- The `ChangePin` screen is only reachable from the authenticated Settings area, not from the `LOGINSTACK`
- `debug.keystore` exception in `.gitignore` is intentional for development builds
