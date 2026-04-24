---
description: "Task list for Onboarding Flow — migrated from existing implementation"
---

# Tasks: Onboarding Flow

**Input**: Design documents from `specs/onboarding-flow/`
**Status**: All tasks completed (migrated feature)
**Prerequisites**: spec.md ✅  plan.md ✅

---

## Phase 1: Foundation (Shared Infrastructure)

**Purpose**: Realm schemas, encryption utilities, navigation routes, enums, and MMKV keys

- [x] T001 Define `TribeAppSchema` in `src/storage/realm/schema/app.ts` (`id`, `publicId`, `appName`, `appType`, `authToken`, `networkType`, `primaryMnemonic`, `primarySeed`, `version`, `walletImage`)
- [x] T002 Define `WalletSchema` and all embedded schemas (`UTXOSchema`, `LabelSchema`, `UTXOInfoSchema`, `BIP85ConfigSchema`, `Tags`) in `src/storage/realm/schema/wallet.ts`
- [x] T003 [P] Implement `src/storage/secure-store.ts` — Keychain `store`, `fetch`, `verifyBiometricAuth` wrappers
- [x] T004 [P] Define `AppType` enum (`ON_CHAIN`, `NODE_CONNECT`, `SUPPORTED_RLN`) in `src/models/enums/AppType.ts`
- [x] T005 [P] Define `PinMethod` enum (`DEFAULT`, `PIN`, `BIOMETRIC`) in `src/models/enums/PinMethod.ts`
- [x] T006 [P] Add all onboarding route constants to `src/navigation/NavigationRoutes.ts`: `LOGINSTACK`, `APPSTACK`, `ONBOARDINGSCREEN`, `WALLETSETUPOPTION`, `SELECTWALLET`, `PROFILESETUP`, `CREATEPIN`, `ENTERSEEDSCREEN`, `RGBLIGHTNINGNODECONNECT`, `IMPORTRGBBACKUP`, `CHANGEPIN`, `SUPPORTTERMANDCONDITION`, `LNLEARNMORE`
- [x] T007 [P] Add MMKV keys for onboarding flags to `src/storage/enum.ts`: `SETUPAPP`, `PIN_METHOD`, `APPID`, `THEME_MODE`
- [x] T008 Implement `hash512`, `encrypt`, `decrypt` in `src/utils/encryption.ts`
- [x] T009 Implement `WalletUtilities.getFingerprintFromSeed` and related helpers in `src/services/wallets/operations/utils.ts`
- [x] T010 Implement `BIP85.bip39MnemonicToEntropy` in `src/services/wallets/operations/BIP85.ts`

**Checkpoint**: Realm schema, Keychain abstraction, enums, routes, and crypto utils all in place

---

## Phase 2: API Handler — Onboarding Methods

**Purpose**: Core orchestration logic for all onboarding paths

- [x] T011 Implement `ApiHandler.setupNewApp` in `src/services/handler/apiHandler.ts` — BIP39 generation, AES key creation + Keychain storage, Realm init, `TribeApp` + `Wallet` record creation, relay challenge/register for all three `AppType` paths
- [x] T012 [P] Implement `ApiHandler.createPin` — re-encrypts AES key under `hash512(pin)`, persists `PIN_METHOD=PIN`
- [x] T013 [P] Implement `ApiHandler.changePin` — updates Keychain entry for new PIN or reverts to default
- [x] T014 Implement `ApiHandler.loginWithPin` — decrypts AES key, inits Realm, returns `{key, isWalletOnline}`
- [x] T015 [P] Implement `ApiHandler.biometricLogin` — verifies biometric signature via `SecureStore.verifyBiometricAuth`
- [x] T016 Implement `ApiHandler.restoreApp(mnemonic)` — relay lookup → delegates to `setupNewApp` (node backup) or `RGBServices.restore` + `refreshRgbWallet` (file backup)
- [x] T017 [P] Implement `ApiHandler.restoreWithBackupFile` — file-based RGB restore using `ApiHandler.restoreAppImage`
- [x] T018 [P] Implement `ApiHandler.checkRgbNodeConnection(params)` — tests RGB node connectivity, returns `{pubkey}` or error

**Checkpoint**: All service methods callable; mutation hooks wirable in screens

---

## Phase 3: User Story 1 — New Wallet Setup (P1)

**Goal**: User can create a new on-chain Bitcoin wallet from scratch

**Independent Test**: Fresh install → complete create-new flow → verify `APPSTACK` reached, `TribeApp` record in Realm

- [x] T019 Implement `OnboardingSlides.tsx` — 2-slide `FlatList` carousel with CTA navigation to `WALLETSETUPOPTION`
- [x] T020 [P] Implement `OnboardingSlideComponent.tsx` — single slide component (title, subtitle, illustration)
- [x] T021 Implement `WalletSetupOption.tsx` — "Create New" and "Recovery Phrase" option cards; network selection alert (dev only)
- [x] T022 Implement `SelectWallet.tsx` — wallet type selector (ON_CHAIN, NODE_CONNECT, SUPPORTED_RLN); Firebase notification permission request; navigates to `PROFILESETUP` or `RGBLIGHTNINGNODECONNECT`
- [x] T023 [P] Implement `SelectWalletTypeOption.tsx` — reusable option card with icon, title, subtitle, right-arrow
- [x] T024 Implement `ProfileSetup.tsx` — name text input, image picker via `react-native-image-crop-picker`; calls `ApiHandler.setupNewApp` via react-query mutation; loading overlay; analytics `logCustomEvent`
- [x] T025 Implement `CreatePin.tsx` + `CreatePinContainer.tsx` — 4-digit PIN entry + confirm with `KeyPadView`; calls `ApiHandler.createPin`; handles biometric enroll path
- [x] T026 [P] Implement `RememberPasscode.tsx` — biometric enroll toggle/reminder component

**Checkpoint**: Full create-new path functional end-to-end; `APPSTACK` reachable

---

## Phase 4: User Story 4 — Returning User Login (P1)

**Goal**: Existing users can authenticate via PIN or biometrics on re-launch

**Independent Test**: Kill/relaunch on set-up device → PIN or Face ID prompt appears → verify `APPSTACK` reached

- [x] T027 Implement `Login.tsx` — thin wrapper that mounts `EnterPinContainer`; `enableBack={false}`
- [x] T028 Implement `EnterPinContainer.tsx` — 4-digit PIN input with `KeyPadView`; auto-triggers biometric on mount if `PIN_METHOD=BIOMETRIC`; calls `ApiHandler.loginWithPin` or `ApiHandler.biometricLogin`; handles iOS/Android timing difference (1000 ms / 300 ms post-biometric)

**Checkpoint**: Login via PIN and biometrics both functional

---

## Phase 5: User Story 2 — Seed Phrase Recovery (P1)

**Goal**: User can recover wallet via 12/24-word BIP39 mnemonic

**Independent Test**: Enter known mnemonic → verify `ApiHandler.restoreApp` called → verify `APPSTACK` navigation

- [x] T029 Implement `EnterSeedScreen.tsx` — thin header wrapper over `EnterSeedContainer`
- [x] T030 Implement `EnterSeedContainer.tsx` — 24-word BIP39 seed grid with `FlatList`; autocomplete from `bip39` word list; invalid word highlight; calls `ApiHandler.restoreApp`; shows `RecoverRGBStatModal` on success; `InProgessPopupContainer` during load
- [x] T031 [P] Implement `RecoverRGBStatModal.tsx` — post-restore status summary modal

**Checkpoint**: Seed recovery path functional; relay backup and file backup sub-paths both reachable

---

## Phase 6: User Story 3 — RGB Lightning Node Connect (P2)

**Goal**: Power user can connect a custom RGB Lightning node

**Independent Test**: Enter valid node URL → connection check succeeds → navigate to `ProfileSetup` with `NODE_CONNECT` params

- [x] T032 Implement `RgbLightningNodeConnect.tsx` — URL + auth inputs; auto-extract node ID from URL; Bearer/Basic toggle; calls `ApiHandler.checkRgbNodeConnection` via mutation; shows `NodeConnectingPopupContainer` then `NodeConnectSuccessPopupContainer` with 3 s auto-dismiss; navigates to `PROFILESETUP` with `nodeConnectParams`
- [x] T033 [P] Implement `LightningNodeDetailsContainer.tsx` — sub-form for URL, node ID, user ID, password, bearer token fields
- [x] T034 [P] Implement `NodeConnectingPopupContainer.tsx` — animated "connecting" popup
- [x] T035 [P] Implement `NodeConnectSuccessPopupContainer.tsx` — "connected" confirmation popup
- [x] T036 [P] Implement `SupportTermAndCondition.tsx` — T&C acceptance screen for Supported RLN path
- [x] T037 [P] Implement informational screens: `LNLearnMore.tsx`, `OnchainLearnMore.tsx`, `SupportLearnMore.tsx`
- [x] T038 [P] Implement `BitcoinBackedAssetContainer.tsx` — marketing/info container used in learn-more screens

**Checkpoint**: NODE_CONNECT and SUPPORTED_RLN paths both functional

---

## Phase 7: User Story 5 — RGB Backup File Restore (P2)

**Goal**: User can restore from a local `.rgb_backup` file

**Independent Test**: Select valid `.rgb_backup` file → verify `ApiHandler.restoreWithBackupFile` called → verify `APPSTACK` navigation

- [x] T039 Implement `ImportRgbBackup.tsx` — file picker via `@react-native-documents/picker`; `keepLocalCopy` for cross-platform file access; calls `ApiHandler.restoreWithBackupFile`; loading overlay; error toast on failure; `logCustomEvent(events.APP_RECOVERED)` on success; navigates to `APPSTACK`

**Checkpoint**: Backup file restore path functional on both iOS and Android

---

## Phase 8: User Story 6 — Change/Remove PIN (P3)

**Goal**: Authenticated user can update or remove their PIN from Settings

**Independent Test**: Navigate to ChangePin from Settings → submit new PIN → verify `ApiHandler.changePin` called

- [x] T040 Implement `ChangePin.tsx` — thin header wrapper over `ChangePinContainer`
- [x] T041 Implement `ChangePinContainer.tsx` — 4-digit PIN input; calls `ApiHandler.changePin`; navigates back on success

**Checkpoint**: PIN change and PIN removal both functional

---

## Phase 9: Polish & Quality Gates

- [x] T042 [P] Lint all onboarding files — `npm run lint`
- [x] T043 [P] TypeScript compile check — `npx tsc --noEmit`
- [x] T044 Smoke test new-wallet path on iOS simulator
- [x] T045 Smoke test new-wallet path on Android emulator
- [x] T046 Smoke test PIN login and biometric login on both platforms
- [x] T047 Smoke test seed recovery path on both platforms

---

## Gaps (Not Yet Addressed)

- [ ] G-001 ⚠️ Add unit tests for `setupNewApp`, `restoreApp`, `createPin`, `loginWithPin` in `__tests__/apiHandler-onboarding.test.ts`
- [ ] G-002 ⚠️ Replace hardcoded English strings in `ChangePin.tsx` with i18n translation keys
- [ ] G-003 Replace `console.log('Notification permission denied on Android')` in `SelectWallet.tsx` with structured handling
- [ ] G-004 Add `usePreventRemove` / navigation listener guard in `ProfileSetup.tsx` and `EnterSeedContainer.tsx` to prevent partial-state abandonment during active mutations

---

## Dependencies & Execution Order

All phases are complete. For future additions referencing this feature:

- Foundation (Phase 1) must be complete before any screen work
- `ApiHandler` methods (Phase 2) must exist before screen mutations can be wired
- US1 (Phase 3) and US4 (Phase 4) are the highest-priority paths and were implemented first
- US2 (Phase 5) depends on Phase 2 `restoreApp`; US5 (Phase 7) depends on `restoreWithBackupFile`
- US3 (Phase 6) depends on `checkRgbNodeConnection` and Phase 3's `ProfileSetup`
- US6 (Phase 8) depends on Phase 4 login being functional (ChangePin is post-auth only)
