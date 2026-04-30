## 1. Fix TransactionsList.tsx — sort instead of reverse

- [x] 1.1 Replace `.reverse()` with `.sort((a, b) => b.createdAt - a.createdAt)` in the `filteredTransactions` useMemo

## 2. Fix CoinAllTransaction.tsx — sort instead of reverse

- [x] 2.1 Replace `.reverse()` with `.sort((a, b) => b.createdAt - a.createdAt)` in the `filteredTransactions` useMemo

## 3. Fix CollectibleDetailsScreen.tsx — correct transactionsData and imports

- [x] 3.1 Add `Transfer` to the import from `src/models/interfaces/RGBWallet`
- [x] 3.2 Fix `transactionsData` useMemo: replace `.slice(-5)` non-NodeConnect path with all transactions cast as `Transfer[]`
- [x] 3.3 Fix NODE_CONNECT sort direction to descending (dateB - dateA)
- [x] 3.4 Add `limitToVisibleRows` prop to the `TransactionsList` component call

## 4. Fix IFADetails.tsx — missing return and correct transactionsData

- [x] 4.1 Add `Transfer` to the import from `src/models/interfaces/RGBWallet`
- [x] 4.2 Add missing `return` statement to the `transactionsData` useMemo callback
- [x] 4.3 Replace `.slice(-4)` non-NodeConnect path with all transactions cast as `Transfer[]`
- [x] 4.4 Fix NODE_CONNECT sort direction to descending (dateB - dateA)
- [x] 4.5 Add `limitToVisibleRows` prop to the `TransactionsList` component call

## 5. Tests

- [x] 5.1 Add/update Jest unit tests for `filterGasFreeTransfers` + sort to verify newest-first output
