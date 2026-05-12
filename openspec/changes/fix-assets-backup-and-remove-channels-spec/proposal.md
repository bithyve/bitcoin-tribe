## Why

Production behavior has diverged from parts of the current OpenSpec text for assets, backup, and channels. These inconsistencies cause ambiguous implementation and test expectations, especially around appType gating, campaign-claim sats requirements, backup confirmation, and deprecated channel functionality.

## What Changes

- Re-verify and correct assets requirements that currently gate behavior on `appType` values where production support differs.
- Update campaign-claim requirements so sats prerequisites depend on campaign type: witness claims do not require sats, while blinded claims require sats.
- Update backup requirements to require mnemonic confirmation using one random word, remove cloud backup of RGB assets, and require automatic encrypted relay backup upload with state updates.
- Remove the channels capability specification because RLN channel features are not part of production Tribe behavior.
- Remove or adjust any OpenSpec cross-references that point to the removed channels capability.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `assets`: Correct appType gating language and make campaign sats requirements campaign-type aware.
- `backup`: Add random mnemonic word confirmation, remove cloud backup requirements, and specify automatic encrypted relay upload with state update semantics.
- `channels`: Remove production-inapplicable RLN channels requirements from the canonical specs.

## Impact

- Primary files: `openspec/specs/assets/spec.md`, `openspec/specs/backup/spec.md`, and `openspec/specs/channels/spec.md` (removal).
- May require wording cleanup in other OpenSpec capability files if they directly reference channels.
- No runtime code changes in this change set.

## Non-goals

- No implementation changes in React Native source code.
- No onboarding flow redesign beyond spec text consistency.
- No changes to Realm schema, migrations, or encryption primitives.

## Assumptions

- `SUPPORTED_RLN` functionality is considered non-production and should not remain as a standalone production channels capability.
- Campaign types are represented as witness or blinded modes in the claim flow and existing code behavior already implies sats requirements for blinded claims.
- Backup relay upload stores encrypted payloads and maintains last-backup metadata in app state.

## Required Checks

- Touches Realm schema: No.
- Touches `src/services/messaging/` or `src/bare/`: No.
- Affects existing Maestro flows: No direct flow file changes in this spec-only update.

## Rollback Plan

If these spec updates are found to conflict with intended product behavior, revert this change by restoring the prior versions of the affected OpenSpec files (including reintroducing the channels spec file) and archive a corrective OpenSpec follow-up.