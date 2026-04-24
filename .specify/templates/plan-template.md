# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x / React Native 0.81 / React 19
**Primary Dependencies**: React Navigation v6, Realm 12, react-query v3, MMKV, Reanimated 4
**Storage**: Realm (on-device ORM at `src/storage/realm/`), react-native-keychain (`src/storage/secure-store.ts`)
**Testing**: Jest 29 with react-native preset — `npm test` — test files in `__tests__/`
**Target Platform**: iOS 15+ and Android 8+ — both flavours (dev / production)
**Project Type**: Self-custodial Bitcoin + RGB asset mobile wallet
**Performance Goals**: Screen transitions < 300 ms; crypto operations non-blocking (worker/service layer)
**Constraints**: Offline-capable; no secrets in logs; private keys only via keychain
**Scale/Scope**: Single-codebase RN app — ~535 TypeScript source files across 14 screen domains

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

### Source Code (repository root)

```text
src/
├── screens/<domain>/          # UI screens for this feature (PascalCase .tsx)
├── components/                # Any new reusable UI components (PascalCase .tsx)
├── hooks/                     # New custom hooks (camelCase, use-prefix .tsx)
├── services/<domain>/         # Business logic / crypto / network (camelCase .ts)
├── storage/
│   ├── realm/schema/          # New or modified Realm schemas
│   └── secure-store.ts        # Keychain additions (if any)
├── models/
│   ├── enums/                 # New TypeScript enums
│   └── interfaces/            # New TypeScript interfaces
├── navigation/
│   └── NavigationRoutes.ts    # New route name constants
└── utils/                     # Pure helper functions (camelCase .ts)

__tests__/                     # Jest test files (<Subject>.test.ts / .tsx)
```

**Structure Decision**: Single React Native project. All feature code lives under `src/` following the domain slice pattern. Tests live in `__tests__/`. No separate backend — all network calls go through `src/services/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
