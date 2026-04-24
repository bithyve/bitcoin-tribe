---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Bitcoin Tribe)

- **Screens**: `src/screens/<domain>/<ScreenName>.tsx` (PascalCase)
- **Components**: `src/components/<ComponentName>.tsx` (PascalCase)
- **Hooks**: `src/hooks/use<Name>.tsx` (camelCase, use-prefix)
- **Services**: `src/services/<domain>/<ServiceName>.ts` (camelCase)
- **Realm schemas**: `src/storage/realm/schema/<SchemaName>.ts`
- **Models / interfaces**: `src/models/interfaces/<Name>.ts`
- **Models / enums**: `src/models/enums/<Name>.ts`
- **Navigation routes**: `src/navigation/NavigationRoutes.ts`
- **Tests**: `__tests__/<Subject>.test.ts` or `__tests__/<Subject>.test.tsx`
- **Test command**: `npm test`

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Navigation wiring, new route constants, shared types

- [ ] T001 Add new route constant(s) to `src/navigation/NavigationRoutes.ts`
- [ ] T002 [P] Add new TypeScript interfaces to `src/models/interfaces/`
- [ ] T003 [P] Add new TypeScript enums to `src/models/enums/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define/update Realm schema in `src/storage/realm/schema/` (bump schema version if needed)
- [ ] T005 [P] Implement core service in `src/services/<domain>/` with typed interfaces
- [ ] T006 [P] Add secure-store entry in `src/storage/secure-store.ts` (if new keychain key required)
- [ ] T007 Wire service into AppContext or react-query if shared state is needed
- [ ] T008 Add error handling types/utilities in `src/utils/` for this domain

**Checkpoint**: Foundation ready — Realm schema migrated, service layer callable, shared state wired

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (`npm test`)**

- [ ] T010 [P] [US1] Unit test for [ServiceName] in `__tests__/[ServiceName].test.ts`
- [ ] T011 [P] [US1] Unit test for Realm schema migration in `__tests__/[SchemaName].test.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create screen `src/screens/<domain>/[ScreenName].tsx`
- [ ] T013 [P] [US1] Create hook `src/hooks/use[Name].tsx` for screen ↔ service bridge
- [ ] T014 [US1] Implement service method in `src/services/<domain>/[ServiceName].ts` (depends on T004–T008)
- [ ] T015 [US1] Wire screen into Navigator in `src/navigation/Navigator.tsx`
- [ ] T016 [US1] Add loading / error / empty states to screen
- [ ] T017 [US1] Verify on iOS simulator and Android emulator

**Checkpoint**: User Story 1 screen is reachable, service is called, data renders — testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Unit test in `__tests__/[Subject].test.ts`
- [ ] T019 [P] [US2] Edge-case test for [scenario] in `__tests__/[Subject].test.ts`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create screen or component `src/screens/<domain>/[ScreenName].tsx`
- [ ] T021 [US2] Extend service in `src/services/<domain>/[ServiceName].ts`
- [ ] T022 [US2] Update hook `src/hooks/use[Name].tsx` with new data/actions
- [ ] T023 [US2] Integrate with User Story 1 screen / components (if needed)

**Checkpoint**: User Stories 1 AND 2 both work independently — verify on device/simulator

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Unit test in `__tests__/[Subject].test.ts`
- [ ] T025 [P] [US3] Edge-case / error-path test in `__tests__/[Subject].test.ts`

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create screen or component `src/screens/<domain>/[ScreenName].tsx`
- [ ] T027 [US3] Extend service in `src/services/<domain>/[ServiceName].ts`
- [ ] T028 [US3] Wire into Navigator and verify navigation flow

**Checkpoint**: All user stories independently functional — run `npm test` and smoke test on both platforms

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Run `npm run lint` — fix any ESLint errors introduced
- [ ] TXXX [P] Run `npm test` — ensure all tests pass
- [ ] TXXX Run `tsc --noEmit` — zero TypeScript errors
- [ ] TXXX Smoke test all affected screens on iOS simulator
- [ ] TXXX Smoke test all affected screens on Android emulator
- [ ] TXXX Review for hardcoded secrets or sensitive data in logs
- [ ] TXXX Update `src/loc/` i18n strings for any new user-facing text
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Run all tests:
npm test

# Run a single test file:
npm test -- __tests__/[Subject].test.ts

# TypeScript check:
npx tsc --noEmit

# Lint:
npm run lint

# Launch dev app on iOS simulator:
npm run ios

# Launch dev app on Android emulator:
npm run android
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
