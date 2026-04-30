> `yarn bare-pack` is NOT required — no changes to src/services/messaging/ or src/bare/.
> Realm schema is NOT changed — no schemaVersion bump or migration needed.

## Context

RGB asset transactions are stored in Realm DB under each asset's `transactions` array. For NODE_CONNECT mode, `getRgbAssetTransactions` explicitly reverses the API response before storing, so Realm holds them **newest-first**. For non-NodeConnect paths the order depends on the API response (also newest-first in practice).

Several UI components assumed **oldest-first** storage and called `.reverse()` to flip the array, or called `.slice(-N)` to take the "latest" N items. Both assumptions are wrong when data is already newest-first.

Additionally, the `useMemo` in `IFADetails.tsx` lacked a `return` statement, causing `transactionsData` to always be `undefined` — making the Recent Transactions section permanently empty.

## Goals / Non-Goals

**Goals:**
- Newest-first ordering in all transaction list views, regardless of Realm storage order.
- Latest transaction visible in the "Recent Transactions" section on CollectibleDetailsScreen and IFADetails.
- `IFADetails` `transactionsData` is no longer `undefined`.

**Non-Goals:**
- No changes to Realm storage order.
- No changes to the NODE_CONNECT/SUPPORTED_RLN sort path (it already uses `createdAt`-based comparison; only the direction is corrected where it was ascending).
- No changes to `CoinDetailsScreen` (sorts ascending and passes all transactions to `TransactionsList` with `limitToVisibleRows` — already correct).

## Decisions

### Sort by `createdAt` descending instead of `.reverse()`

**Decision**: Replace all `.reverse()` calls with `.sort((a, b) => b.createdAt - a.createdAt)`.

**Rationale**: `.reverse()` is order-dependent — it only works when the input is oldest-first. A deterministic `createdAt` sort works correctly regardless of storage order. `Transfer.createdAt` is a Unix timestamp (number), so numeric subtraction is safe and efficient.

**Alternative considered**: Normalize storage order (always oldest-first) by removing the `.reverse()` in `getRgbAssetTransactions`. Rejected because it touches the data layer and could affect other consumers.

### Pass all transactions to `TransactionsList`; remove manual `.slice(-N)` limits

**Decision**: Remove `.slice(-5)` and `.slice(-4)` in `CollectibleDetailsScreen` and `IFADetails`. Pass the full transaction array and add `limitToVisibleRows` prop to the `TransactionsList` call.

**Rationale**: `.slice(-N)` takes the last N elements of a newest-first array, which are the *oldest* N — the opposite of what is wanted. `TransactionsList` already has `limitToVisibleRows` logic that respects the visible row cap. Delegating slicing to the component avoids duplication and ensures correctness.

### Add `Transfer` type import in both screens

**Decision**: Import `Transfer` from `src/models/interfaces/RGBWallet` in `CollectibleDetailsScreen` and `IFADetails` for the `as Transfer[]` type casts in the fallback branch.

**Rationale**: TypeScript requires the type to be in scope for safe casting.

## Files to be Modified

| File | Change |
|------|--------|
| `src/screens/assets/TransactionsList.tsx` | Replace `.reverse()` with `.sort((a,b) => b.createdAt - a.createdAt)` |
| `src/screens/assets/CoinAllTransaction.tsx` | Replace `.reverse()` with `.sort((a,b) => b.createdAt - a.createdAt)` |
| `src/screens/assets/CollectibleDetailsScreen.tsx` | Fix `transactionsData` useMemo; remove `.slice(-5)`; add `Transfer` import; add `limitToVisibleRows` to `TransactionsList` |
| `src/screens/assets/IFADetails.tsx` | Add missing `return`; fix `transactionsData` useMemo; remove `.slice(-4)`; add `Transfer` import; add `limitToVisibleRows` to `TransactionsList` |

## Risks / Trade-offs

- [Risk] `.sort()` mutates in place but `filterGasFreeTransfers` already returns a new array, so no Realm object mutation occurs. → Mitigation: verified `filterGasFreeTransfers` uses a `for...of` push into a new array.
- [Risk] NODE_CONNECT sort now sorts descending (date desc) for the merged payment+transaction object in `CollectibleDetailsScreen` / `IFADetails`, whereas before it sorted ascending. → Mitigation: consistent with the change goal (newest-first); `TransactionsList` expects newest-first input.

## Migration Plan

Pure UI fix — no data migration needed. Deploy by releasing updated JS bundle.
