const mockRestClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('src/services/rest/RestClient', () => ({
  __esModule: true,
  default: mockRestClient,
}));

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    HEXA_ID: 'hexa-id',
    RELAY: 'https://relay.example',
    NETWORK_TYPE: 'TESTNET',
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    select: jest.fn(v => v.ios),
  },
}));

jest.mock('src/storage', () => ({
  Keys: {
    SERVICE_FEE: 'SERVICE_FEE',
  },
  Storage: {
    get: jest.fn(),
  },
}));

describe('Relay', () => {
  let Relay;
  let Storage;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    Relay = require('../src/services/relay').default;
    Storage = require('src/storage').Storage;
  });

  it('getTestSats posts the faucet request and returns response data', async () => {
    mockRestClient.post.mockResolvedValueOnce({ data: { funded: true } });

    await expect(Relay.getTestSats('tb1abc', 2)).resolves.toEqual({ funded: true });
    expect(mockRestClient.post).toHaveBeenCalledWith(
      'https://relay.example/btcfaucet/getcoins',
      expect.objectContaining({
        HEXA_ID: 'hexa-id',
        address: 'tb1abc',
        amount: 2,
        network: 'iris',
      }),
    );
  });

  it('getPresetAssets returns response data', async () => {
    mockRestClient.get.mockResolvedValueOnce({ data: { status: true, results: [] } });

    await expect(Relay.getPresetAssets()).resolves.toEqual({ status: true, results: [] });
  });

  it('getTestcoins throws immediately on mainnet', async () => {
    const { NetworkType } = require('../src/services/wallets/enums');

    await expect(Relay.getTestcoins('tb1abc', NetworkType.MAINNET)).rejects.toThrow(
      'Invalid network: failed to fund via testnet',
    );
  });

  it('getTestcoins funds via getTestSats for regtest/testnet4', async () => {
    const { NetworkType } = require('../src/services/wallets/enums');
    jest.spyOn(Relay, 'getTestSats').mockResolvedValueOnce({});

    await expect(Relay.getTestcoins('tb1abc', NetworkType.REGTEST)).resolves.toEqual({
      funded: true,
      txid: '',
    });
    expect(Relay.getTestSats).toHaveBeenCalledWith('tb1abc', 1);
  });

  it('getTestcoins posts to the testnet faucet for normal testnet', async () => {
    const { NetworkType } = require('../src/services/wallets/enums');
    mockRestClient.post.mockResolvedValueOnce({ data: { txid: 'tx1', funded: true } });

    await expect(Relay.getTestcoins('tb1abc', NetworkType.TESTNET)).resolves.toEqual({
      txid: 'tx1',
      funded: true,
    });
  });

  it('fetchFeeAndExchangeRates returns normalized data', async () => {
    mockRestClient.post.mockResolvedValueOnce({
      data: {
        exchangeRates: { USD: { last: 1 } },
        averageTxFees: { TESTNET: {} },
        serviceFee: { issuanceFee: { address: 'a', fee: 1, includeTxFee: false } },
      },
    });

    await expect(Relay.fetchFeeAndExchangeRates()).resolves.toEqual({
      exchangeRates: { USD: { last: 1 } },
      averageTxFees: { TESTNET: {} },
      serviceFee: { issuanceFee: { address: 'a', fee: 1, includeTxFee: false } },
    });
  });

  it('fetchFeeAndExchangeRates throws a generic error when the request fails', async () => {
    mockRestClient.post.mockRejectedValueOnce(new Error('boom'));

    await expect(Relay.fetchFeeAndExchangeRates()).rejects.toThrow(
      'Failed fetch fee and exchange rates',
    );
  });

  it('getChallenge returns the challenge payload', async () => {
    mockRestClient.post.mockResolvedValueOnce({ data: { challenge: 'abc' } });

    await expect(Relay.getChallenge('app-id', 'pub')).resolves.toEqual({ challenge: 'abc' });
  });

  it('removeWalletPicture calls RestClient.delete with auth header', async () => {
    mockRestClient.delete.mockResolvedValueOnce({ data: { success: true } });

    await expect(Relay.removeWalletPicture('auth', 'app-id')).resolves.toEqual({ success: true });
    expect(mockRestClient.delete).toHaveBeenCalledWith(
      'https://relay.example/app/removeWalletPicture',
      { appID: 'app-id' },
      { Authorization: 'Bearer auth' },
    );
  });

  it('syncFcmToken posts the token update', async () => {
    mockRestClient.post.mockResolvedValueOnce({ data: { updated: true } });

    await expect(Relay.syncFcmToken('auth', 'fcm')).resolves.toEqual({ updated: true });
  });

  it('createSupportedNode returns the created node payload', async () => {
    mockRestClient.post.mockResolvedValueOnce({ data: { nodeId: 'node-1' } });

    await expect(Relay.createSupportedNode()).resolves.toEqual({ nodeId: 'node-1' });
  });

  it('getNodeById returns node data', async () => {
    mockRestClient.get.mockResolvedValueOnce({ data: { node: { status: 'RUNNING' } } });

    await expect(Relay.getNodeById('node-1', 'auth')).resolves.toEqual({
      node: { status: 'RUNNING' },
    });
  });

  it('startNodeById returns start-node data', async () => {
    mockRestClient.get.mockResolvedValueOnce({ data: { started: true } });

    await expect(Relay.startNodeById('node-1', 'auth')).resolves.toEqual({ started: true });
  });

  it('saveNodeMnemonic derives status, mnemonic, and peer url from node details', async () => {
    jest.spyOn(Relay, 'getNodeById').mockResolvedValueOnce({
      node: {
        status: 'RUNNING',
        mnemonic: 'mnemonic',
        peerDNS: 'peer.example.com',
        peerPort: 9735,
      },
    });

    await expect(Relay.saveNodeMnemonic('node-1', 'auth')).resolves.toEqual({
      status: 'RUNNING',
      mnemonic: 'mnemonic',
      peerUrl: 'peer.example.com:9735',
    });
  });

  it('getAssetIssuanceFee returns cached service-fee data when present', async () => {
    Storage.get.mockReturnValueOnce(
      JSON.stringify({ issuanceFee: { address: 'cached', fee: 1, includeTxFee: true } }),
    );

    await expect(Relay.getAssetIssuanceFee()).resolves.toEqual({
      address: 'cached',
      fee: 1,
      includeTxFee: true,
    });
    expect(mockRestClient.get).not.toHaveBeenCalled();
  });

  it('getAssetIssuanceFee fetches the service fee when cache is empty', async () => {
    Storage.get.mockReturnValueOnce(null);
    mockRestClient.get.mockResolvedValueOnce({
      data: { issuanceFee: { address: 'remote', fee: 2, includeTxFee: false } },
    });

    await expect(Relay.getAssetIssuanceFee()).resolves.toEqual({
      address: 'remote',
      fee: 2,
      includeTxFee: false,
    });
  });
});