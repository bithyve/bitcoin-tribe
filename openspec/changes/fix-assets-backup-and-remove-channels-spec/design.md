## Context

Current canonical specs include behavior that is no longer production-aligned:
- Assets wording consistently treats `NODE_CONNECT` and `SUPPORTED_RLN` as equivalent without clearly constraining production expectations.
- Campaign claims do not currently distinguish sats prerequisites by campaign type.
- Backup still specifies cloud RGB backup support and does not explicitly capture random-word confirmation and stateful relay update behavior.
- Channels has a standalone capability spec despite RLN channels not being in production scope.

This change is a spec-synchronization update. No runtime code, schema, or migration changes are intended.

## Goals / Non-Goals

**Goals:**
- Align assets requirements with production appType constraints and campaign-type sats logic.
- Update backup requirements to include one-random-word mnemonic confirmation.
- Remove unsupported cloud RGB backup requirement text.
- Require automatic encrypted backup upload to relay with state updates.
- Remove the channels spec and clean cross-references.

**Non-Goals:**
- Implementing or changing app runtime code paths.
- Introducing new backup storage providers.
- Defining new RLN channel behavior for non-production builds.

## Decisions

1. Keep changes scoped to existing capability specs (`assets`, `backup`, `channels`) instead of introducing a new capability.
   - Rationale: This is behavioral correction/removal of existing capability text.
   - Alternative considered: Add a meta capability for production support matrix. Rejected to avoid duplicative capability boundaries.

2. Remove channels by deleting the canonical channels spec file in apply phase.
   - Rationale: User requirement is explicit removal of channels specification file(s).
   - Alternative considered: Leave file with deprecation-only text. Rejected because source-of-truth still advertises unsupported behavior.

3. Express campaign sats requirement with explicit blinded/witness branching in the claim requirement.
   - Rationale: Keeps requirement testable and prevents ambiguous claim eligibility checks.
   - Alternative considered: Move campaign-specific logic into a separate requirement. Rejected to avoid fragmentation.

4. Model relay backup updates as automatic encrypted upload plus state timestamp update.
   - Rationale: Clarifies expected system behavior and observable state after backup.

## Risks / Trade-offs

- [Risk] Legacy references to channels may remain in other docs or code comments.
  -> Mitigation: Search and update direct spec cross-references in `openspec/specs` and mirrored docs if present.

- [Risk] appType wording changes may be interpreted as behavior changes rather than documentation corrections.
  -> Mitigation: Keep requirement language explicit that production-supported behavior applies where relevant.

- [Risk] Removing cloud backup text may impact teams relying on old docs.
  -> Mitigation: Add clear replacement wording that relay encrypted backup is the supported path.

## Migration Plan

1. Update canonical OpenSpec files for `assets` and `backup`.
2. Remove canonical `channels` spec file.
3. Verify no remaining channels spec cross-references in OpenSpec docs.
4. Mark tasks complete and archive the change.

Rollback strategy:
- Restore previous versions of modified/deleted spec files from git history and archive a corrective OpenSpec change.

## Open Questions

- None blocking for this spec-only correction.

## Files To Be Modified

- `openspec/specs/assets/spec.md`
- `openspec/specs/backup/spec.md`
- `openspec/specs/channels/spec.md` (delete)
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/proposal.md`
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/design.md`
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/specs/assets/spec.md`
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/specs/backup/spec.md`
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/specs/channels/spec.md`
- `openspec/changes/fix-assets-backup-and-remove-channels-spec/tasks.md`