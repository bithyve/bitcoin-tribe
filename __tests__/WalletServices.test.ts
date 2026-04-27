jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    NETWORK_TYPE: 'testnet',
  },
}));

jest.mock('src/storage', () => ({
  Keys: {
    AVERAGE_TX_FEE_BY_NETWORK: 'AVERAGE_TX_FEE_BY_NETWORK',
    EXCHANGE_RATES: 'EXCHANGE_RATES',
    SERVICE_FEE: 'SERVICE_FEE',
  },
  Storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('src/services/wallets/operations', () => ({
  __esModule: true,
  default: {
    transferST1: jest.fn(),
    transferST2: jest.fn(),
    calculateAverageTxFee: jest.fn(),
    syncWalletsViaElectrumClient: jest.fn(),
    getNextFreeExternalAddress: jest.fn(),
  },
}));

jest.mock('src/services/electrum/client', () => ({
  __esModule: true,
  default: {
    setActivePeer: jest.fn(),
    connect: jest.fn(),
    resetCurrentPeerIndex: jest.fn(),
  },
  ELECTRUM_CLIENT: {
    isClientConnected: true,
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getObjectByIndex: jest.fn(),
    updateObjectByPrimaryId: jest.fn(),
    updateObjectById: jest.fn(),
    getCollection: jest.fn(),
  },
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    fetchFeeAndExchangeRates: jest.fn(),
    getTestcoins: jest.fn(),
  },
}));

jest.mock('src/services/rgb/RGBServices', () => ({
  __esModule: true,
  default: {
    createUtxos: jest.fn(),
    getUnspents: jest.fn(),
  },
}));

jest.mock('src/services/rgbnode/RLNNodeApi', () => ({
  RLNNodeApiServices: jest.fn().mockImplementation(() => ({
    getBtcBalance: jest.fn(),
    sendBTCTransaction: jest.fn(),
    estimateFee: jest.fn(),
  })),
}));

jest.mock('../src/services/handler/services/RgbWalletServices', () => ({
  refreshRgbWallet: jest.fn(),
}));

jest.mock('../src/services/handler/services/RLNServices', () => ({
  getNodeOnchainBtcAddress: jest.fn(),
}));

jest.mock('../src/services/handler/services/backupService', () => ({
  backupAppImage: jest.fn(),
}));

import {
  getFeeAndExchangeRates,
  resetWalletServicesTestDeps,
  sendToAddress,
  setWalletServicesTestDeps,
  updateTransaction,
} from '../src/services/handler/services/WalletServices';

describe('WalletServices', () => {
  const mockDeps = {
    config: { NETWORK_TYPE: 'testnet' },
    dbManager: {
      getObjectByIndex: jest.fn(),
      updateObjectByPrimaryId: jest.fn(),
      updateObjectById: jest.fn(),
    },
    storage: {
      get: jest.fn(),
      set: jest.fn(),
    },
    walletOperations: {
      transferST1: jest.fn(),
      transferST2: jest.fn(),
      calculateAverageTxFee: jest.fn(),
      syncWalletsViaElectrumClient: jest.fn(),
      getNextFreeExternalAddress: jest.fn(),
    },
    electrumClient: {
      setActivePeer: jest.fn(),
      connect: jest.fn(),
      resetCurrentPeerIndex: jest.fn(),
    },
    electrumClientState: {
      isClientConnected: true,
    },
    relay: {
      fetchFeeAndExchangeRates: jest.fn(),
      getTestcoins: jest.fn(),
    },
    rgbServices: {
      createUtxos: jest.fn(),
      getUnspents: jest.fn(),
    },
    refreshRgbWallet: jest.fn(),
    getNodeOnchainBtcAddress: jest.fn(),
    backupAppImage: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    setWalletServicesTestDeps(mockDeps);
  });

  afterEach(() => {
    resetWalletServicesTestDeps();
  });

  it('updates transaction and triggers app image backup', async () => {
    mockDeps.dbManager.getObjectByIndex.mockReturnValue({
      toJSON: () => ({
        id: 'wallet-1',
        specs: {
          transactions: [
            {
              txid: 'tx-1',
              metadata: { note: 'old' },
            },
          ],
        },
      }),
    });

    const result = await updateTransaction({
      txid: 'tx-1',
      updateProps: { metadata: { note: 'new' } },
    });

    expect(result).toBe(true);
    expect(mockDeps.dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      expect.anything(),
      'id',
      'wallet-1',
      expect.objectContaining({
        specs: expect.any(Object),
      }),
    );
    expect(mockDeps.backupAppImage).toHaveBeenCalledWith({
      tnxMeta: {
        txid: 'tx-1',
        metaData: { note: 'new' },
      },
    });
  });

  it('throws when fee data is missing in sendToAddress', async () => {
    mockDeps.dbManager.getObjectByIndex.mockReturnValue({
      toJSON: () => ({ id: 'wallet-1', specs: { transactions: [] } }),
    });
    mockDeps.storage.get.mockReturnValue(undefined);

    await expect(
      sendToAddress({
        recipient: { address: 'tb1qtest', amount: 1000 },
        skipSync: true,
      }),
    ).rejects.toThrow('Transaction fee data not found. Please try again later.');
  });

  it('sends on-chain tx through transfer phases', async () => {
    mockDeps.dbManager.getObjectByIndex.mockReturnValue({
      toJSON: () => ({ id: 'wallet-1', specs: { transactions: [] } }),
    });
    mockDeps.storage.get.mockReturnValue(
      JSON.stringify({
        testnet: {
          low: {
            averageTxFee: 1,
            feePerByte: 1,
          },
        },
      }),
    );
    mockDeps.walletOperations.transferST1.mockResolvedValue({
      txPrerequisites: { low: { fee: 10 } },
    });
    mockDeps.walletOperations.transferST2.mockResolvedValue({ txid: 'tx-abc' });

    const result = await sendToAddress({
      recipient: { address: 'tb1qdest', amount: 2000 },
      skipSync: true,
    });

    expect(result).toEqual({ txid: 'tx-abc' });
    expect(mockDeps.walletOperations.transferST1).toHaveBeenCalledTimes(1);
    expect(mockDeps.walletOperations.transferST2).toHaveBeenCalledTimes(1);
    expect(mockDeps.dbManager.updateObjectById).toHaveBeenCalledTimes(1);
  });

  it('delegates fee and exchange rates storage writes', async () => {
    mockDeps.relay.fetchFeeAndExchangeRates.mockResolvedValue({
      exchangeRates: { exchangeRates: { USD: 100000 } },
      serviceFee: { registerAssetFee: 1000 },
    });
    mockDeps.walletOperations.calculateAverageTxFee.mockResolvedValue({});

    await getFeeAndExchangeRates();

    expect(mockDeps.relay.fetchFeeAndExchangeRates).toHaveBeenCalledTimes(1);
    expect(mockDeps.storage.set).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ USD: 100000 }),
    );
    expect(mockDeps.storage.set).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ registerAssetFee: 1000 }),
    );
  });
});
