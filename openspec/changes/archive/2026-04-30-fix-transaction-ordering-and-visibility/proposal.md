## Why

Recent transactions are not visible in the "Recent Transactions" section on Asset screens (Collectible, IFA), and transaction ordering is wrong (oldest-first instead of newest-first). These bugs affect `TransactionsList`, `CoinAllTransaction`, `CollectibleDetailsScreen`, and `IFADetails` — all due to incorrect assumptions about Realm storage order and a missing `return` statement.

**Realm schema touched**: No  
**src/services/messaging/ or src/bare/ touched**: No

## What Changes

- **`TransactionsList.tsx`**: Replace `.reverse()` with `.sort((a, b) => b.createdAt - a.createdAt)` so the component always renders newest-first regardless of input order.
- **`CoinAllTransaction.tsx`**: Replace `.reverse()` with `.sort((a, b) => b.createdAt - a.createdAt)` for consistent newest-first ordering in the "View All" screen.
- **`CollectibleDetailsScreen.tsx`**: Replace `.slice(-5)` (takes oldest 5) with passing all transactions so `TransactionsList` handles limiting; `Transfer` type added to imports for type cast.
- **`IFADetails.tsx`**: Add missing `return` statement to the `useMemo` callback (critical bug — `transactionsData` was always `undefined`); replace `.slice(-4)` with all transactions; `Transfer` type added to imports for type cast.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `transaction-display`: Ordering and visibility rules for recent transactions on asset detail screens have changed — newest-first is now guaranteed.

## Non-goals

- No changes to how transactions are fetched or stored in Realm.
- No changes to NODE_CONNECT / SUPPORTED_RLN sort logic (already uses `createdAt`-based sort, just direction changed where applicable).
- No changes to `CoinDetailsScreen` (already correct).

## Impact

- **Files modified**: `src/screens/assets/TransactionsList.tsx`, `src/screens/assets/CoinAllTransaction.tsx`, `src/screens/assets/CollectibleDetailsScreen.tsx`, `src/screens/assets/IFADetails.tsx`
- No API changes, no Realm schema changes, no new dependencies.
- The `Transfer` interface (`createdAt: number`) is already defined in `src/models/interfaces/RGBWallet.ts`.

## Rollback Plan

N/A — no persistent storage or auth is modified. Reverting the four file edits fully restores previous behaviour.
