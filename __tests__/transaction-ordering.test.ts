/**
 * Tests for transaction ordering and visibility fixes.
 *
 * Verifies that:
 * 1. filterGasFreeTransfers returns a new array safe to sort
 * 2. Sorting by createdAt descending always yields newest-first regardless
 *    of input order (oldest-first, newest-first, or random)
 * 3. The useMemo sort pattern used in the fixed components is correct
 */

import { Transfer, TransferKind, TransferStatus } from '../src/models/interfaces/RGBWallet';

// ---------------------------------------------------------------------------
// Mock react-native-mmkv so Storage works in Jest environment
// ---------------------------------------------------------------------------
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: jest.fn(() => undefined),
    set: jest.fn(),
    get: jest.fn(() => undefined),
  }),
}));

// ---------------------------------------------------------------------------
// Mock src/storage to return an empty gas-free map (no gas-free txs)
// ---------------------------------------------------------------------------
jest.mock('src/storage', () => ({
  Storage: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
  },
  Keys: {
    GAS_FREE_TRANSACTIONS: 'GAS_FREE_TRANSACTIONS',
  },
}));

import { filterGasFreeTransfers } from '../src/utils/gasFreeTransactions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTransfer = (createdAt: number, txid = `tx-${createdAt}`): Transfer =>
  ({
    txid,
    createdAt,
    kind: TransferKind.RECEIVE,
    status: TransferStatus.SETTLED,
    amount: 100,
    batchTransferIdx: 0,
    internalId: txid,
    expiration: null,
    transportEndpoints: [],
  } as unknown as Transfer);

// Comparator used by all fixed components
const sortDesc = (a: Transfer, b: Transfer) => b.createdAt - a.createdAt;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Transaction ordering — newest-first sort', () => {
  it('sorts oldest-first input into newest-first output', () => {
    const input = [
      makeTransfer(1000), // oldest
      makeTransfer(2000),
      makeTransfer(3000), // newest
    ];
    const result = filterGasFreeTransfers(input).sort(sortDesc);
    expect(result[0].createdAt).toBe(3000);
    expect(result[1].createdAt).toBe(2000);
    expect(result[2].createdAt).toBe(1000);
  });

  it('sorts newest-first input correctly (no double-reversal)', () => {
    const input = [
      makeTransfer(3000), // newest already first
      makeTransfer(2000),
      makeTransfer(1000), // oldest
    ];
    const result = filterGasFreeTransfers(input).sort(sortDesc);
    expect(result[0].createdAt).toBe(3000);
    expect(result[1].createdAt).toBe(2000);
    expect(result[2].createdAt).toBe(1000);
  });

  it('sorts random-order input into newest-first output', () => {
    const input = [
      makeTransfer(2000),
      makeTransfer(5000),
      makeTransfer(1000),
      makeTransfer(4000),
      makeTransfer(3000),
    ];
    const result = filterGasFreeTransfers(input).sort(sortDesc);
    expect(result.map(t => t.createdAt)).toEqual([5000, 4000, 3000, 2000, 1000]);
  });

  it('returns empty array when given empty input', () => {
    const result = filterGasFreeTransfers([]).sort(sortDesc);
    expect(result).toEqual([]);
  });

  it('returns single-item array unchanged', () => {
    const input = [makeTransfer(9999)];
    const result = filterGasFreeTransfers(input).sort(sortDesc);
    expect(result.length).toBe(1);
    expect(result[0].createdAt).toBe(9999);
  });

  it('does not mutate the original input array', () => {
    const input = [makeTransfer(1000), makeTransfer(3000), makeTransfer(2000)];
    const originalOrder = input.map(t => t.createdAt);
    filterGasFreeTransfers(input).sort(sortDesc);
    // input should be unchanged (filterGasFreeTransfers creates new array)
    expect(input.map(t => t.createdAt)).toEqual(originalOrder);
  });
});

describe('Transaction slicing — newest-first slice(0, N)', () => {
  it('slice(0, 5) on newest-first sorted array returns the 5 most recent', () => {
    const input = Array.from({ length: 10 }, (_, i) =>
      makeTransfer((i + 1) * 1000),
    );
    const sorted = filterGasFreeTransfers(input).sort(sortDesc);
    const top5 = sorted.slice(0, 5);
    expect(top5.map(t => t.createdAt)).toEqual([10000, 9000, 8000, 7000, 6000]);
  });
});
