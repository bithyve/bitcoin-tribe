# Bitcoin Tribe Constitution

## Project Identity

**Bitcoin Tribe** is a self-custodial Bitcoin and RGB asset wallet for iOS and Android. It is built with React Native 0.81 + React 19, TypeScript (strict-ish), Realm as the on-device database, and react-native-keychain for secure credential storage. The app targets two release flavours: **dev** (internal testing) and **production** (App Store / Play Store).

- Primary language: TypeScript (99 % of `src/`)
- Platforms: iOS 15+ and Android 8+
- Entry point: `index.js` → `src/App.tsx`
- Navigation: React Navigation v6 (native-stack + bottom-tabs)
- State: Realm (`src/storage/realm/`) + react-query v3 + MMKV
- Crypto domain: bitcoinjs-lib, bip32/39, @noble/curves, orbis1-sdk-rn (RGB protocol)
- P2P messaging: Hyperswarm 4 / bare-rpc / react-native-bare-kit

---

## I. Code Boundaries

Every change must respect the layered module layout:

| Layer | Location | Rule |
|-------|----------|------|
| Screens (UI) | `src/screens/<domain>/` | Thin presentational layer — no business logic |
| Reusable UI | `src/components/` | Stateless or context-only; no direct service calls |
| Hooks | `src/hooks/` | Bridge between UI and services/context; one concern per hook |
| Contexts | `src/contexts/` | App-wide state only (`AppContext`, `LocalizationContext`) |
| Services | `src/services/<domain>/` | All business logic, crypto ops, network calls |
| Storage | `src/storage/` | Realm ORM (`realm/`), secure keychain (`secure-store.ts`) |
| Models | `src/models/enums/`, `src/models/interfaces/` | Shared TypeScript types — no logic |
| Navigation | `src/navigation/` | Route names in `NavigationRoutes.ts`; no business logic |
| Theme | `src/theme/` | Design tokens only |
| Utils | `src/utils/` | Pure functions with no side effects |

**Import direction**: Screens → Hooks → Services → Storage/Models. Services MUST NOT import from screens or components.

---

## II. Naming Conventions

- **Component / Screen files**: PascalCase `.tsx` (e.g., `HomeScreen.tsx`, `AssetCard.tsx`)
- **Service / utility files**: camelCase `.ts` (e.g., `RGBServices.ts`, `dbManager.ts`)
- **Hook files**: camelCase prefixed with `use` (e.g., `useWallets.tsx`, `useBalance.tsx`)
- **Directory names**: camelCase (e.g., `wallets/`, `rgbnode/`, `onBoarding/`)
- **Navigation routes**: screaming-snake-case string enums in `NavigationRoutes.ts`
- **Realm schemas**: PascalCase class names in `src/storage/realm/schema/`
- **Branch names**: `feat/<slug>`, `fix/<slug>`, `refactor/<slug>`, `chore/<slug>`
- **Commit messages**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`

---

## III. TypeScript Requirements

- Compiler options are governed by `tsconfig.json` (`strict: false`, but `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` all `true`)
- All new code MUST be typed; `any` is forbidden unless wrapped in a comment justifying it
- Interfaces and enums MUST live in `src/models/interfaces/` or `src/models/enums/` respectively
- Do NOT add or relax compiler flags without team approval

---

## IV. Testing Requirements

- Test framework: **Jest 29** with `react-native` preset (`npm test`)
- Test location: `__tests__/` at repo root (current convention — do not scatter tests into `src/`)
- Naming: `<Subject>.test.ts` or `<Subject>.test.tsx`
- Every new service function MUST have at least one unit test
- Realm schema changes MUST be accompanied by a migration test in `__tests__/`
- Crypto operations (key derivation, signing, encoding) MUST have deterministic unit tests
- UI smoke tests are optional but encouraged for critical flows (onboarding, send, receive)

---

## V. Security (NON-NEGOTIABLE)

- Private keys, mnemonics, and passphrases MUST only be stored via `src/storage/secure-store.ts` (react-native-keychain) — never in Realm, MMKV, AsyncStorage, or logs
- No secrets in source code or committed config files; use `react-native-config` / `.env` files (gitignored)
- All `.env*` files MUST remain gitignored; `GoogleService-Info*.plist` and `google-services.json` are in repo only for CI — do not add new credential files
- Network requests to Electrum / RGB node / relay MUST use the existing service abstractions in `src/services/` — do not open raw sockets in screens
- Follow OWASP Mobile Top 10; do not log sensitive data

---

## VI. Platform & Build Rules

- All changes MUST work on both **iOS** and **Android** unless explicitly scoped otherwise
- Dev flavour: `ENVFILE=.env`, app ID suffix `.dev`; Production: `ENVFILE=.env.production`
- Native module changes require CocoaPods pod install (iOS) and Gradle sync (Android)
- CI pipelines (`.github/workflows/`) handle release builds via Fastlane — do not modify `Fastfile` without approval
- `patch-package` patches in `patches/` MUST be preserved; never delete them during dependency upgrades

---

## VII. Dependency Rules

- All new packages require justification (size, maintenance, native module overhead)
- Prefer packages already in use (e.g., Reanimated for animation, react-query for async fetching)
- Native modules require testing on both platforms before merging
- Peer dependencies for `react-native` packages must match the current RN version (0.81.x)

---

## VIII. Quality Gates

Every PR MUST pass all of the following before merge:

1. `npm run lint` — zero ESLint errors (Prettier warnings are off per `.eslintrc.js`)
2. `npm test` — all Jest tests green
3. TypeScript compilation — zero `tsc --noEmit` errors
4. Manual smoke test on both iOS and Android simulators for affected screens
5. No new hardcoded secrets or credentials
6. Constitution compliance verified by reviewer

---

## Governance

This constitution supersedes all other implicit conventions. Amendments require:
1. A documented rationale in the PR description
2. Approval from at least one senior team member
3. Update to this file with the new **Last Amended** date

All spec reviews (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`) must verify compliance with this constitution before proceeding.

**Version**: 1.0.0 | **Ratified**: 2026-04-23 | **Last Amended**: 2026-04-23
