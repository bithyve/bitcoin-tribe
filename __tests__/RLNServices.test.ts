const mockNodeApi = {
  getAddress: jest.fn(),
  listTransactions: jest.fn(),
  nodeinfo: jest.fn(),
  getassetmedia: jest.fn(),
  openchannel: jest.fn(),
  createutxos: jest.fn(),
  closechannel: jest.fn(),
  listchannels: jest.fn(),
  sync: jest.fn(),
  unlock: jest.fn(),
  assetbalance: jest.fn(),
};

jest.mock('src/services/rgbnode/RLNNodeApi', () => ({
  RLNNodeApiServices: jest.fn(() => mockNodeApi),
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    saveNodeMnemonic: jest.fn(),
    getNodeById: jest.fn(),
    startNodeById: jest.fn(),
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getObjectByIndex: jest.fn(),
    updateObjectByPrimaryId: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('src/storage/enum', () => ({
  RealmSchema: {
    RgbWallet: 'RgbWallet',
    TribeApp: 'TribeApp',
  },
}));

jest.mock('src/utils/snakeCaseToCamelCaseCase', () => ({
  snakeCaseToCamelCaseCase: jest.fn(value => value),
}));

jest.mock('../src/services/handler/services/AppAndLoginServices', () => ({
  createNewWallet: jest.fn(() => Promise.resolve({ id: 'wallet-id' })),
}));

import Relay from 'src/services/relay';
import dbManager from 'src/storage/realm/dbManager';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import { createNewWallet } from '../src/services/handler/services/AppAndLoginServices';
import {
  checkNodeStatus,
  closeChannel,
  getAssetBalance,
  getChannels,
  getNodeOnchainBtcAddress,
  getNodeOnchainBtcTransactions,
  getassetmedia,
  openChannel,
  saveNodeMnemonic,
  startNode,
  syncNode,
  unlockNode,
  viewNodeInfo,
} from '../src/services/handler/services/RLNServices';

describe('RLNServices', () => {
  const rgbWallet = {
    mnemonic: 'wallet-mnemonic',
    nodeUrl: 'https://node.url',
    nodeAuthentication: 'api-key',
    nodeMnemonic: 'old-node-mnemonic',
  };
  const tribeApp = {
    id: 'node-id',
    authToken: 'auth-token',
  };
  const openChannelParams = {
    peerPubkeyAndOptAddr: 'peer@1.2.3.4:9735',
    capacitySat: 1000,
    pushMsat: 50,
    assetAmount: 2,
    assetId: 'asset-id',
    isPublic: true,
    withAnchors: false,
    feeBaseMsat: 1,
    feeProportionalMillionths: 2,
    temporaryChannelId: 'temp-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (dbManager.getObjectByIndex as jest.Mock).mockImplementation(schema => {
      if (schema === 'RgbWallet') {
        return rgbWallet;
      }
      return tribeApp;
    });
  });

  it('returns the node bitcoin address when the API responds', async () => {
    mockNodeApi.getAddress.mockResolvedValueOnce({ address: 'bc1qxyz' });

    await expect(getNodeOnchainBtcAddress()).resolves.toEqual({ address: 'bc1qxyz' });
  });

  it('throws when the node bitcoin address request returns nothing', async () => {
    mockNodeApi.getAddress.mockResolvedValueOnce(null);

    await expect(getNodeOnchainBtcAddress()).rejects.toThrow('Failed to connect to node');
  });

  it('stores node on-chain transactions when the response contains a transaction list', async () => {
    mockNodeApi.listTransactions.mockResolvedValueOnce({ transactions: [{ txid: '1' }] });

    await expect(getNodeOnchainBtcTransactions()).resolves.toEqual({
      transactions: [{ txid: '1' }],
    });
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      'RgbWallet',
      'mnemonic',
      'wallet-mnemonic',
      { nodeOnchainTransactions: [{ txid: '1' }] },
    );
  });

  it('throws when the transaction response has no transaction list', async () => {
    mockNodeApi.listTransactions.mockResolvedValueOnce({});

    await expect(getNodeOnchainBtcTransactions()).rejects.toThrow('Failed to connect to node');
  });

  it('returns node info when available', async () => {
    mockNodeApi.nodeinfo.mockResolvedValueOnce({ pubkey: 'node-pubkey' });

    await expect(viewNodeInfo()).resolves.toEqual({ pubkey: 'node-pubkey' });
  });

  it('throws when node info is unavailable', async () => {
    mockNodeApi.nodeinfo.mockResolvedValueOnce(undefined);

    await expect(viewNodeInfo()).rejects.toThrow('Failed to connect to node');
  });

  it('saves a new node mnemonic, updates realm state, and creates a wallet', async () => {
    (Relay.saveNodeMnemonic as jest.Mock).mockResolvedValueOnce({
      status: 'ready',
      mnemonic: 'new-node-mnemonic',
      peerUrl: 'peer.example.com',
    });

    await expect(saveNodeMnemonic('node-id', 'auth-token')).resolves.toBe('ready');
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenNthCalledWith(
      1,
      'RgbWallet',
      'mnemonic',
      'wallet-mnemonic',
      { nodeMnemonic: 'new-node-mnemonic' },
    );
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenNthCalledWith(
      2,
      'TribeApp',
      'id',
      'node-id',
      { primaryMnemonic: 'new-node-mnemonic' },
    );
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenNthCalledWith(
      3,
      'RgbWallet',
      'mnemonic',
      'wallet-mnemonic',
      { peerDNS: 'peer.example.com' },
    );
    expect(createNewWallet).toHaveBeenCalledWith({});
  });

  it('returns the node status without updates when the mnemonic is unchanged', async () => {
    (Relay.saveNodeMnemonic as jest.Mock).mockResolvedValueOnce({
      status: 'ready',
      mnemonic: 'old-node-mnemonic',
      peerUrl: 'peer.example.com',
    });

    await expect(saveNodeMnemonic('node-id', 'auth-token')).resolves.toBe('ready');
    expect(dbManager.updateObjectByPrimaryId).not.toHaveBeenCalled();
    expect(createNewWallet).not.toHaveBeenCalled();
  });

  it('throws when the node mnemonic lookup fails', async () => {
    (Relay.saveNodeMnemonic as jest.Mock).mockResolvedValueOnce(null);

    await expect(saveNodeMnemonic('node-id', 'auth-token')).rejects.toThrow(
      'Failed to fetch node status',
    );
  });

  it('returns the nested node status when present', async () => {
    (Relay.getNodeById as jest.Mock).mockResolvedValueOnce({
      nodeInfo: { data: { status: 'RUNNING' } },
    });

    await expect(checkNodeStatus('node-id', 'auth-token')).resolves.toBe('RUNNING');
  });

  it('falls back to node.status when nodeInfo is missing', async () => {
    (Relay.getNodeById as jest.Mock).mockResolvedValueOnce({
      node: { status: 'PENDING' },
    });

    await expect(checkNodeStatus('node-id', 'auth-token')).resolves.toBe('PENDING');
  });

  it('returns null when checkNodeStatus throws', async () => {
    (Relay.getNodeById as jest.Mock).mockRejectedValueOnce(new Error('bad gateway'));

    await expect(checkNodeStatus('node-id', 'auth-token')).resolves.toBeNull();
  });

  it('returns the start-node response when the API responds', async () => {
    (Relay.startNodeById as jest.Mock).mockResolvedValueOnce({ success: true });

    await expect(startNode('node-id', 'auth-token')).resolves.toEqual({ success: true });
  });

  it('throws when startNode receives no response', async () => {
    (Relay.startNodeById as jest.Mock).mockResolvedValueOnce(null);

    await expect(startNode('node-id', 'auth-token')).rejects.toThrow(
      'Failed to fetching node status',
    );
  });

  it('returns asset media when available', async () => {
    mockNodeApi.getassetmedia.mockResolvedValueOnce({ media: 'binary-data' });

    await expect(getassetmedia('digest')).resolves.toEqual({ media: 'binary-data' });
  });

  it('throws when asset media is unavailable', async () => {
    mockNodeApi.getassetmedia.mockResolvedValueOnce(null);

    await expect(getassetmedia('digest')).rejects.toThrow('Failed to connect to node');
  });

  it('returns the open-channel response on success', async () => {
    mockNodeApi.openchannel.mockResolvedValueOnce({ channelId: 'channel-id' });

    await expect(openChannel(openChannelParams)).resolves.toEqual({ channelId: 'channel-id' });
  });

  it('creates UTXOs and retries when openChannel reports no available UTXOs', async () => {
    mockNodeApi.openchannel
      .mockResolvedValueOnce({ error: 'not enough utxos', name: 'NoAvailableUtxos' })
      .mockResolvedValueOnce({ channelId: 'channel-id' });
    mockNodeApi.createutxos.mockResolvedValueOnce({ created: true });

    await expect(openChannel(openChannelParams)).resolves.toBeUndefined();
    expect(mockNodeApi.createutxos).toHaveBeenCalledWith({
      fee_rate: 1,
      num: 1,
      size: 1000,
      skip_sync: false,
      up_to: false,
    });
    expect(mockNodeApi.openchannel).toHaveBeenCalledTimes(2);
  });

  it('throws the node error when openChannel fails for another reason', async () => {
    mockNodeApi.openchannel.mockResolvedValueOnce({ error: 'bad peer', name: 'OtherError' });

    await expect(openChannel(openChannelParams)).rejects.toThrow('bad peer');
  });

  it('throws when openChannel gets a falsy response', async () => {
    mockNodeApi.openchannel.mockResolvedValueOnce(false);

    await expect(openChannel(openChannelParams)).rejects.toThrow('Failed to connect to node');
  });

  it('returns the close-channel response on success', async () => {
    mockNodeApi.closechannel.mockResolvedValueOnce({ success: true });

    await expect(closeChannel({ channelId: 'channel-id', peerPubKey: 1 as any })).resolves.toEqual({
      success: true,
    });
  });

  it('throws when closeChannel returns an error', async () => {
    mockNodeApi.closechannel.mockResolvedValueOnce({ error: 'close failed' });

    await expect(closeChannel({ channelId: 'channel-id', peerPubKey: 1 as any })).rejects.toThrow(
      'close failed',
    );
  });

  it('returns converted channels when the response includes channels', async () => {
    mockNodeApi.listchannels.mockResolvedValueOnce({ channels: [{ channel_id: '1' }] });
    (snakeCaseToCamelCaseCase as jest.Mock).mockReturnValueOnce({
      channels: [{ channelId: '1' }],
    });

    await expect(getChannels()).resolves.toEqual([{ channelId: '1' }]);
  });

  it('returns the converted response when no channels array exists', async () => {
    mockNodeApi.listchannels.mockResolvedValueOnce({ count: 0 });
    (snakeCaseToCamelCaseCase as jest.Mock).mockReturnValueOnce({ count: 0 });

    await expect(getChannels()).resolves.toEqual({ count: 0 });
  });

  it('rethrows list-channels errors', async () => {
    mockNodeApi.listchannels.mockRejectedValueOnce(new Error('channel failure'));

    await expect(getChannels()).rejects.toThrow('channel failure');
  });

  it('returns the sync response when node sync succeeds', async () => {
    mockNodeApi.sync.mockResolvedValueOnce({ synced: true });

    await expect(syncNode()).resolves.toEqual({ synced: true });
  });

  it('throws when node sync returns nothing', async () => {
    mockNodeApi.sync.mockResolvedValueOnce(null);

    await expect(syncNode()).rejects.toThrow('Failed to sync node');
  });

  it('returns the unlock response when successful', async () => {
    mockNodeApi.unlock.mockResolvedValueOnce({ unlocked: true });

    await expect(unlockNode()).resolves.toEqual({ unlocked: true });
    expect(mockNodeApi.unlock).toHaveBeenCalledWith('tribe@2024', 'auth-token');
  });

  it('throws the unlock error when the node API reports one', async () => {
    mockNodeApi.unlock.mockResolvedValueOnce({ error: 'unlock failed' });

    await expect(unlockNode()).rejects.toThrow('unlock failed');
  });

  it('returns the converted asset balance when successful', async () => {
    mockNodeApi.assetbalance.mockResolvedValueOnce({ balance: 10 });
    (snakeCaseToCamelCaseCase as jest.Mock).mockReturnValueOnce({ balance: 10 });

    await expect(getAssetBalance('asset-id')).resolves.toEqual({ balance: 10 });
  });

  it('throws the asset balance error when the node reports one', async () => {
    mockNodeApi.assetbalance.mockResolvedValueOnce({ error: 'balance failed' });

    await expect(getAssetBalance('asset-id')).rejects.toThrow('balance failed');
  });

  it('throws when asset balance returns a falsy response', async () => {
    mockNodeApi.assetbalance.mockResolvedValueOnce(false);

    await expect(getAssetBalance('asset-id')).rejects.toThrow('Failed to unlock node');
  });
});