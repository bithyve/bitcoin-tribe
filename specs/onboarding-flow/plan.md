# Implementation Plan: Onboarding Flow

**Branch**: `feat/onboarding-flow` (implemented on `main`/`sprint`) | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)
**Input**: Reverse-engineered from `src/screens/onBoarding/`, `src/services/handler/apiHandler.ts`, `src/services/wallets/`, `src/storage/realm/schema/`

## Summary

The Onboarding Flow is the entry point for all users of Bitcoin Tribe. It handles three creation paths (new on-chain wallet, RGB Lightning node connect, supported RLN) and two recovery paths (seed phrase + relay, local `.rgb_backup` file), plus persistent login via PIN or biometrics. The flow is guarded at the `LOGINSTACK` root based on the `Keys.SETUPAPP` MMKV flag.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React Native 0.81 / React 19
**Primary Dependencies**: React Navigation v6, react-query v3, MMKV, react-native-biometrics, react-native-keychain, bip39, bitcoinjs-lib, @react-native-firebase/messaging, @react-native-documents/picker, react-native-image-crop-picker
**Storage**: Realm 12 (`TribeApp`, `Wallet` schemas) + react-native-keychain (AES encryption key)
**Testing**: Jest 29 with react-native preset — `npm test` — test files in `__tests__/`
**Target Platform**: iOS 15+ and Android 8+ — both flavours (dev / production)
**Project Type**: Self-custodial Bitcoin + RGB asset mobile wallet — onboarding module
**Performance Goals**: Full new-wallet setup flow in < 3 min; PIN/biometric re-login < 10 s
**Constraints**: Offline new-wallet creation not supported (relay challenge required); private keys in Keychain only
**Scale/Scope**: ~43 files, ~4,200 lines across onBoarding screens, wallet service, and ApiHandler subset

---

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. Code Boundaries | ✅ Pass | Screens call `ApiHandler` via react-query mutations; no business logic in screen files |
| II. Naming Conventions | ⚠️ Minor drift | `ChangePin.tsx` contains hardcoded English strings instead of i18n keys |
| III. TypeScript | ✅ Pass | All files typed; no unguarded `any` detected in onboarding screens |
| IV. Testing | ❌ Gap | No unit tests for `setupNewApp`, `restoreApp`, `createPin`, `loginWithPin` |
| V. Security | ✅ Pass | AES key in Keychain; mnemonic in Realm (acceptable — Realm is AES-encrypted at rest); no plaintext secrets in logs |
| VI. Platform | ✅ Pass | iOS/Android both covered; timing differences handled per-platform |
| VII. Dependencies | ✅ Pass | All deps already present in package.json |
| VIII. Quality Gates | ⚠️ Partial | Lint and TS clean; missing test coverage |

---

## Project Structure

### Documentation (this feature)

```text
specs/onboarding-flow/
├── spec.md      # This feature spec
├── plan.md      # This file
└── tasks.md     # Task list (all completed)
```

### Source Code (repository root)

```text
src/
├── screens/onBoarding/              # All onboarding UI screens (14 screens, 17 components)
│   ├── OnboardingSlides.tsx         # Welcome carousel (2 slides)
│   ├── WalletSetupOption.tsx        # Create New vs Recovery Phrase choice
│   ├── SelectWallet.tsx             # Wallet type selection + notification permission
│   ├── ProfileSetup.tsx             # Name/image entry → triggers setupNewApp
│   ├── CreatePin.tsx                # 4-digit PIN set + confirm
│   ├── Login.tsx                    # Re-entry: PIN or biometric auth
│   ├── EnterSeedScreen.tsx          # 12/24-word BIP39 seed entry + autocomplete
│   ├── RgbLightningNodeConnect.tsx  # RGB node URL + auth → checkRgbNodeConnection
│   ├── ImportRgbBackup.tsx          # Document picker → restoreWithBackupFile
│   ├── ChangePin.tsx                # Update / remove PIN (from Settings)
│   ├── SupportTermAndCondition.tsx  # T&C for Supported RLN path
│   ├── LNLearnMore.tsx              # Lightning learn-more info screen
│   ├── OnchainLearnMore.tsx         # On-chain learn-more info screen
│   ├── SupportLearnMore.tsx         # Supported RLN learn-more info screen
│   └── components/                  # 17 sub-components (containers, popups, helpers)
│       ├── CreatePinContainer.tsx
│       ├── EnterPinContainer.tsx    # PIN entry + biometric trigger
│       ├── ChangePinContainer.tsx
│       ├── EnterSeedContainer.tsx   # Seed word inputs + BIP39 autocomplete
│       ├── LightningNodeDetailsContainer.tsx
│       ├── NodeConnectingPopupContainer.tsx
│       ├── NodeConnectSuccessPopupContainer.tsx
│       ├── SelectWalletTypeOption.tsx
│       ├── RecoverRGBStatModal.tsx
│       ├── RememberPasscode.tsx
│       ├── BitcoinBackedAssetContainer.tsx
│       ├── OnboardingSlideComponent.tsx
│       ├── TermAndConditionView.tsx
│       ├── UseRGBAssetPopupContainer.tsx
│       ├── LearnMoreContentSection.tsx
│       └── LearnMoreTextView.tsx
│
├── services/
│   ├── handler/
│   │   └── apiHandler.ts            # setupNewApp, restoreApp, createPin, loginWithPin,
│   │                                #   biometricLogin, changePin, checkRgbNodeConnection,
│   │                                #   restoreWithBackupFile
│   └── wallets/
│       ├── enums/index.ts           # NetworkType, DerivationPurpose, AppType-related enums
│       ├── interfaces/wallet.ts     # Wallet, WalletSpecs, AddressCache types
│       ├── factories/WalletFactory.ts
│       └── operations/
│           ├── index.ts             # Bitcoin transaction operations (coinselect, PSBT)
│           ├── utils.ts             # WalletUtilities (getFingerprintFromSeed, etc.)
│           └── BIP85.ts             # BIP85 entropy derivation
│
├── storage/
│   ├── realm/schema/
│   │   ├── app.ts                   # TribeAppSchema (singleton — id, publicId, appType, …)
│   │   └── wallet.ts                # WalletSchema + embedded schemas (UTXOs, labels, etc.)
│   └── secure-store.ts              # Keychain store/fetch/verify for AES key + biometric key
│
├── models/
│   ├── enums/AppType.ts             # ON_CHAIN | NODE_CONNECT | SUPPORTED_RLN
│   └── enums/PinMethod.ts           # DEFAULT | PIN | BIOMETRIC
│
├── navigation/
│   └── NavigationRoutes.ts          # LOGINSTACK, APPSTACK, ONBOARDINGSCREEN,
│                                    # WALLETSETUPOPTION, SELECTWALLET, PROFILESETUP,
│                                    # CREATEPIN, ENTERSEEDSCREEN, RGBLIGHTNINGNODECONNECT,
│                                    # IMPORTRGBBACKUP, CHANGEPIN, SUPPORTTERMANDCONDITION,
│                                    # LNLEARNMORE
│
└── utils/
    ├── encryption.ts                # hash512, encrypt, decrypt helpers
    └── config.ts                    # APP_STAGE, ENVIRONMENT, NETWORK_TYPE, ENC_KEY_STORAGE_IDENTIFIER

__tests__/                           # ⚠️ No onboarding tests currently exist here
```

**Structure Decision**: Single React Native project. All onboarding code is a vertical slice within `src/screens/onBoarding/` (UI) and `src/services/handler/apiHandler.ts` (orchestration). Wallet cryptographic primitives live in `src/services/wallets/operations/`. Storage is Realm + Keychain. No separate backend.

---

## Implementation Phases (as-built)

### Phase 0: Foundation

- Realm schema defined (`TribeApp`, `Wallet`, and 15+ embedded schemas)
- `SecureStore` abstraction over react-native-keychain established
- `ApiHandler` class scaffolded with static async methods
- MMKV `Keys` enum defined for all persistent flags (`SETUPAPP`, `PIN_METHOD`, `APPID`, `THEME_MODE`)
- `NavigationRoutes` enum extended with all onboarding routes
- `AppType` and `PinMethod` enums established

### Phase 1: New Wallet Creation Path (US1)

- `OnboardingSlides` → `WalletSetupOption` → `SelectWallet` → `ProfileSetup` flow implemented
- `ApiHandler.setupNewApp` orchestrates: BIP39 generation, AES key generation + Keychain storage, Realm initialisation, `TribeApp` + `Wallet` record creation, relay challenge/register
- `CreatePin` + `CreatePinContainer` implemented with 4-digit PIN confirm UX
- Network selection alert (dev only) added to `WalletSetupOption`

### Phase 2: Recovery Paths (US2, US5)

- `EnterSeedScreen` + `EnterSeedContainer` with BIP39 autocomplete implemented
- `ApiHandler.restoreApp` implemented: relay lookup → `setupNewApp` (node) or `RGBServices.restore` + `refreshRgbWallet` (file backup)
- `ImportRgbBackup` with `@react-native-documents/picker` document picker implemented
- `ApiHandler.restoreWithBackupFile` implemented
- Analytics event `APP_RECOVERED` logged on success

### Phase 3: RGB Lightning Node Connect (US3)

- `RgbLightningNodeConnect` with URL parsing, Bearer/Basic auth toggle, and connection check implemented
- `ApiHandler.checkRgbNodeConnection` implemented
- `NodeConnectingPopupContainer` / `NodeConnectSuccessPopupContainer` popups with 3 s auto-dismiss
- `AppType.NODE_CONNECT` and `AppType.SUPPORTED_RLN` paths wired in `SelectWallet`

### Phase 4: Login & Change PIN (US4, US6)

- `Login` + `EnterPinContainer` implemented with PIN and biometric paths
- `ApiHandler.loginWithPin` and `ApiHandler.biometricLogin` implemented
- `ReactNativeBiometrics` integration for Face ID / Touch ID / Fingerprint
- `ChangePin` + `ChangePinContainer` implemented (accessible from Settings)
- Platform timing difference (iOS 1000 ms / Android 300 ms) handled post-biometric login

---

## Identified Gaps

| ID | Gap | Severity | Recommendation |
|----|-----|----------|----------------|
| G-001 | No unit tests for `setupNewApp`, `restoreApp`, `createPin`, `loginWithPin` | High | Add `__tests__/apiHandler-onboarding.test.ts` with mocked Realm + Keychain |
| G-002 | `ChangePin.tsx` uses hardcoded English strings instead of i18n keys | Medium | Replace `'Change Passcode'` and `'Keep the passcode field empty to remove'` with `translations` keys |
| G-003 | `console.log` in `SelectWallet.tsx` for denied notification permission | Low | Replace with silent handling or structured analytics event |
| G-004 | No back-navigation guard mid-onboarding — partially initialised state possible | Medium | Add `usePreventRemove` / navigation listener to warn before leaving `ProfileSetup` or `EnterSeedScreen` during active mutation |
