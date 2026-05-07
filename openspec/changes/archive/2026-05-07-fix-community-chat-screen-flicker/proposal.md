## Why

Community chat currently flickers and feels unstable during rapid scrolling, especially around image-heavy messages. This directly impacts readability and confidence in the chat experience, so the rendering path needs to be stabilized now.

## What Changes

- Stabilize community chat message list rendering to avoid unnecessary re-renders while scrolling.
- Improve list virtualization/key extraction behavior so message rows are reused predictably.
- Ensure message ordering and scroll behavior remain unchanged while removing visual flicker.
- Add focused test coverage for the rendering stabilization logic.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `community`: tighten community chat list rendering behavior so rapid scrolling remains visually stable without flicker.

## Impact

- **Touches Realm schema:** No.
- **Touches `src/services/messaging/` or `src/bare/`:** No.
- **Affects existing Maestro flows:** No direct flow changes required (existing community/chat navigation paths are indirectly affected).
- **Affected code:** `src/screens/community/components/MessageList.tsx`, related community chat tests.
- **Dependencies/APIs:** No new dependencies and no API contract changes.

## Non-goals

- Redesigning the community chat UI.
- Changing message send/receive business logic.
- Adding new chat features (reactions, pagination protocol changes, etc.).

## Assumptions

- Flicker is primarily caused by avoidable list-level re-renders and unstable item reconciliation during fast scroll.
- Message objects contain stable identifiers that can be used for deterministic list keys.

## Rollback plan

- Revert this change set to restore the previous `MessageList` implementation if regressions are observed.
- No storage/auth migration rollback is needed because this change does not alter persistent schemas or authentication flows.
