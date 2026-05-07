## Why

Hidden UDA visibility is currently sticky across transfer cycles. When a user hides a UDA by sending it away and later receives the same UDA again, it remains hidden and does not appear on the asset screen, which breaks expected send/receive behavior.

## What Changes

- Update UDA receive synchronization so a previously hidden UDA is automatically restored to visible when it is received back.
- Keep existing manual hide behavior intact for assets that are still not re-received.
- Add/adjust tests around UDA visibility transitions in send/receive flow.
- Realm schema touched: **no**.
- `src/services/messaging/` or `src/bare/` touched: **no**.
- Existing Maestro flows affected: **no** (no flow file changes expected).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `assets`: Receiving a UDA that already exists in hidden state must unhide it so it is visible on the assets screen.

## Impact

- Affected code: RGB asset refresh/sync path and UDA persistence visibility handling.
- Affected UX: Asset list visibility state after UDA round-trip transfers.
- APIs/dependencies: No external API or dependency changes.

## Non-goals

- Redesigning hidden-asset settings UI.
- Changing visibility behavior for non-UDA asset types unless already coupled in existing shared logic.
- Modifying transfer protocol behavior.

## Assumptions

- The hidden state for this scenario is inferred to be persisted locally and not reset by current wallet refresh logic.
- Re-receipt of the same UDA can be identified via stable asset identity already stored in Realm.
