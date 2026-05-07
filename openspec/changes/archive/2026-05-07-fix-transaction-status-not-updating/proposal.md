## Why

Wallet transactions can remain stuck in a `Pending` state after they are confirmed on-chain until the user manually refreshes or restarts the app. This creates inaccurate status visibility and undermines trust in transaction state.

## What Changes

- Ensure wallet transaction screens trigger refresh behavior that updates transaction confirmations automatically while the screen is focused.
- Align status refresh behavior so users do not need manual refresh/restart to observe a confirmed status.
- Add focused test coverage for the auto-update path to prevent regressions.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `wallet`: Update wallet transaction status behavior so pending on-chain transactions auto-transition to confirmed without manual intervention.

## Impact

- Affected area: wallet transaction refresh/update flow in `src/screens/wallet/` components and related query/mutation usage.
- APIs/systems: existing wallet refresh and transaction fetch APIs only (no new APIs).
- Realm schema touched: **No**.
- `src/services/messaging/` or `src/bare/` touched: **No**.
- Existing Maestro flows affected: **No** (no expected flow file updates).

## Non-goals

- Changing transaction confirmation rules from backend services.
- Redesigning wallet transaction UI.
- Altering RGB asset transfer status workflows.

## Assumptions

- The current backend/SDK refresh calls already return updated confirmation state; the issue is in client-side refresh timing/triggering.
- The issue scope is limited to wallet transaction status updates visible in the wallet transaction views.

