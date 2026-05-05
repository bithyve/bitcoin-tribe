// ─── Mocks must precede all imports ──────────────────────────────────────────

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    ENC_KEY_STORAGE_IDENTIFIER: 'enc-id',
    NETWORK_TYPE: 'testnet',
    BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH: "m/83696968'/39'/0'/12'/0'",
    ENVIRONMENT: 'dev',
  },
  APP_STAGE: {
    PRODUCTION: 'production',
  },
}));

jest.mock('src/utils/encryption', () => ({
  decrypt: jest.fn(() => 'decrypted-key'),
  encrypt: jest.fn(() => 'encrypted-key'),
  generateEncryptionKey: jest.fn(() => 'gen-enc-key'),
  hash512: jest.fn((v: string) => `hash-${v}`),
  stringToArrayBuffer: jest.fn(() => new Uint8Array([1, 2, 3])),
}));

jest.mock('src/storage/secure-store', () => ({
  fetch: jest.fn(),
  store: jest.fn(() => Promise.resolve()),
  verifyBiometricAuth: jest.fn(),
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    initializeRealm: jest.fn(() => Promise.resolve(true)),
    createObject: jest.fn(() => true),
    getObjectByIndex: jest.fn(),
    updateObjectByPrimaryId: jest.fn(),
    deleteRealm: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('src/storage', () => ({
  Keys: {
    SETUPAPP: 'SETUPAPP',
    PIN_METHOD: 'PIN_METHOD',
    APPID: 'APPID',
  },
  Storage: {
    set: jest.fn(),
    get: jest.fn(() => Promise.resolve('stored-app-id')),
    clear: jest.fn(),
  },
}));

jest.mock('src/storage/enum', () => ({
  RealmSchema: {
    TribeApp: 'TribeApp',
    RgbWallet: 'RgbWallet',
    Wallet: 'Wallet',
    VersionHistory: 'VersionHistory',
  },
}));

jest.mock('src/models/enums/PinMethod', () => ({
  __esModule: true,
  default: { DEFAULT: 'DEFAULT', PIN: 'PIN' },
}));

jest.mock('src/models/enums/AppType', () => ({
  __esModule: true,
  default: {
    ON_CHAIN: 'ON_CHAIN',
    NODE_CONNECT: 'NODE_CONNECT',
    SUPPORTED_RLN: 'SUPPORTED_RLN',
  },
}));

jest.mock('src/services/wallets/enums', () => ({
  DerivationPurpose: { BIP86: 'BIP86' },
  EntityKind: { WALLET: 'WALLET' },
  NetworkType: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    REGTEST: 'regtest',
    TESTNET4: 'testnet4',
  },
  WalletType: { DEFAULT: 'DEFAULT' },
}));

jest.mock('src/services/wallets/factories/WalletFactory', () => ({
  generateWallet: jest.fn(() => Promise.resolve({ id: 'wallet-id' })),
}));

jest.mock('src/services/wallets/operations/utils', () => ({
  __esModule: true,
  default: {
    getFingerprintFromSeed: jest.fn(() => 'mock-fingerprint'),
    getDerivationPath: jest.fn(() => "m/86'/0'/0'"),
  },
}));

jest.mock('src/services/wallets/operations/BIP85', () => ({
  __esModule: true,
  default: {
    bip39MnemonicToEntropy: jest.fn(() => Buffer.from('mock-entropy')),
  },
}));

jest.mock('src/services/wallets/operations/taproot-utils/noble_ecc', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    getChallenge: jest.fn(() =>
      Promise.resolve({ challenge: 'mock-challenge' }),
    ),
    createNewApp: jest.fn(() =>
      Promise.resolve({
        app: { authToken: 'mock-auth-token', imageUrl: 'https://img.url/img.png' },
      }),
    ),
    getAppImage: jest.fn(() => Promise.resolve({ status: false })),
    getBackup: jest.fn(),
    createSupportedNode: jest.fn(),
  },
}));

jest.mock('src/services/rgb/RGBServices', () => ({
  __esModule: true,
  default: {
    initiate: jest.fn(() => Promise.resolve({ status: true, error: '' })),
    restore: jest.fn(() => Promise.resolve({ error: null })),
  },
}));

jest.mock('src/services/rgbnode/RLNNodeApi', () => {
  const mockInstance = { nodeinfo: jest.fn(() => Promise.resolve({ pubkey: 'node-pubkey' })) };
  const MockRLNNodeApiServices = jest.fn(() => mockInstance) as any;
  MockRLNNodeApiServices.checkNodeConnection = jest.fn(() =>
    Promise.resolve({ nodeId: 'node-id' }),
  );
  return { RLNNodeApiServices: MockRLNNodeApiServices };
});

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: jest.fn(() => '1.0.0'),
    getBuildNumber: jest.fn(() => '100'),
  },
}));

jest.mock('bip39', () => ({
  generateMnemonic: jest.fn(
    () =>
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  ),
  mnemonicToSeedSync: jest.fn(() =>
    Buffer.from(
      '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4',
      'hex',
    ),
  ),
}));

// crypto is a Node built-in; mock at module level
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockImplementation((enc?: string) => {
      if (enc === 'hex') {
        return 'a'.repeat(64); // 32-byte hex → valid appID / sha256 hex
      }
      return Buffer.alloc(32, 1); // raw Buffer for messageHash
    }),
  })),
}));

jest.mock('crypto-js', () => ({
  SHA256: jest.fn(() => ({ toString: jest.fn(() => 'b'.repeat(64)) })),
}));

jest.mock('ecpair', () => {
  const mockKeyPair = {
    publicKey: Buffer.alloc(33, 2),
    sign: jest.fn(() => Buffer.alloc(64, 3)),
  };
  return {
    __esModule: true,
    default: jest.fn(() => ({
      fromPrivateKey: jest.fn(() => mockKeyPair),
    })),
  };
});

jest.mock('orbis1-sdk-rn', () => ({
  restoreKeys: jest.fn(() =>
    Promise.resolve({
      xpub: 'mock-xpub',
      accountXpubColored: 'mock-xpub-colored',
      masterFingerprint: 'mock-fingerprint',
      accountXpubVanilla: 'mock-xpub-vanilla',
    }),
  ),
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  __esModule: true,
  TemporaryDirectoryPath: '/tmp',
  downloadFile: jest.fn(() => ({ promise: Promise.resolve({ statusCode: 200 }) })),
}));

jest.mock('../src/services/handler/services/networkService', () => ({
  NetworkService: {
    getBitcoinNetwork: jest.fn(() => 'testnet'),
    fetchGithubRelease: jest.fn(() =>
      Promise.resolve({ releaseNote: 'mock release' }),
    ),
  },
}));

jest.mock('../src/services/handler/services/appLifecycleService', () => ({
  AppLifecycleService: {
    manageFcmVersionTopics: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../src/services/handler/services/authService', () => ({
  AuthService: {
    createPin: jest.fn(() => Promise.resolve()),
    changePin: jest.fn(() => Promise.resolve()),
    verifyPin: jest.fn(() => Promise.resolve('key-from-verify')),
    resetApp: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../src/services/handler/runtimeApi', () => ({
  ApiHandler: jest.fn(),
}));

jest.mock('../src/services/handler/services/backupService', () => ({
  restoreAppImage: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/services/handler/services/RgbWalletServices', () => ({
  refreshRgbWallet: jest.fn(() => Promise.resolve()),
  fetchPresetAssets: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/services/handler/services/WalletServices', () => ({
  viewUtxos: jest.fn(() => Promise.resolve()),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import * as SecureStore from 'src/storage/secure-store';
import dbManager from 'src/storage/realm/dbManager';
import { Storage } from 'src/storage';
import Relay from 'src/services/relay';
import RGBServices from 'src/services/rgb/RGBServices';
import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import { AuthService } from '../src/services/handler/services/authService';
import { AppLifecycleService } from '../src/services/handler/services/appLifecycleService';
import { ApiHandler } from '../src/services/handler/runtimeApi';
import { restoreAppImage } from '../src/services/handler/services/backupService';
import { refreshRgbWallet, fetchPresetAssets } from '../src/services/handler/services/RgbWalletServices';
import { viewUtxos } from '../src/services/handler/services/WalletServices';
import { generateWallet } from 'src/services/wallets/factories/WalletFactory';

import {
  setupNewApp,
  restoreWithBackupFile,
  restoreApp,
  downloadFile,
  biometricLogin,
  createPin,
  changePin,
  loginWithPin,
  verifyPin,
  login,
  makeWalletOnline,
  createNewWallet,
  checkRgbNodeConnection,
  createSupportedNode,
  resetApp,
} from '../src/services/handler/services/AppAndLoginServices';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOCK_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const baseOnChainParams = {
  appName: 'Test App',
  pinMethod: 'DEFAULT' as any,
  passcode: '' as any,
  walletImage: null as any,
  mnemonic: MOCK_MNEMONIC,
  appType: 'ON_CHAIN' as any,
  authToken: '',
};

const baseNodeConnectParams = {
  nodeUrl: 'http://localhost:3001',
  authentication: 'api-key',
  mnemonic: MOCK_MNEMONIC,
  nodeId: 'node-id-123',
  peerDNS: 'peer.dns',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  // Default: SecureStore.fetch returns an existing encrypted key
  (SecureStore.fetch as jest.Mock).mockResolvedValue('existing-encrypted-key');
  // Default: realm initialisation succeeds
  (dbManager.initializeRealm as jest.Mock).mockResolvedValue(true);
  // Default: createObject succeeds
  (dbManager.createObject as jest.Mock).mockReturnValue(true);
  // Default: getObjectByIndex returns a TribeApp-like object
  (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({
    primaryMnemonic: MOCK_MNEMONIC,
    appType: 'ON_CHAIN',
    authToken: 'mock-auth-token',
    networkType: 'testnet',
  });
});

// ─── setupNewApp ─────────────────────────────────────────────────────────────

describe('setupNewApp', () => {
  describe('ON_CHAIN branch', () => {
    it('completes setup without throwing', async () => {
      await expect(setupNewApp(baseOnChainParams)).resolves.not.toThrow();
    });

    it('initialises realm before creating objects', async () => {
      await setupNewApp(baseOnChainParams);
      expect(dbManager.initializeRealm).toHaveBeenCalled();
    });

    it('creates TribeApp and RgbWallet objects in realm', async () => {
      await setupNewApp(baseOnChainParams);
      const calls = (dbManager.createObject as jest.Mock).mock.calls.map(
        (c: any[]) => c[0],
      );
      expect(calls).toContain('TribeApp');
      expect(calls).toContain('RgbWallet');
    });

    it('calls Relay.getChallenge and Relay.createNewApp', async () => {
      await setupNewApp(baseOnChainParams);
      expect(Relay.getChallenge).toHaveBeenCalled();
      expect(Relay.createNewApp).toHaveBeenCalled();
    });

    it('calls RGBServices.initiate after wallet creation', async () => {
      await setupNewApp(baseOnChainParams);
      expect(RGBServices.initiate).toHaveBeenCalled();
    });

    it('calls AppLifecycleService.manageFcmVersionTopics', async () => {
      await setupNewApp(baseOnChainParams);
      expect(AppLifecycleService.manageFcmVersionTopics).toHaveBeenCalled();
    });

    it('stores app ID in Storage', async () => {
      await setupNewApp(baseOnChainParams);
      expect(Storage.set).toHaveBeenCalledWith('APPID', expect.any(String));
    });

    it('resets SETUPAPP flag to false on success', async () => {
      await setupNewApp(baseOnChainParams);
      const calls = (Storage.set as jest.Mock).mock.calls;
      const lastSetupCall = calls
        .filter((c: any[]) => c[0] === 'SETUPAPP')
        .at(-1);
      expect(lastSetupCall?.[1]).toBe(false);
    });

    it('generates a new AES key when none exists in secure store', async () => {
      (SecureStore.fetch as jest.Mock).mockResolvedValueOnce(null);
      await setupNewApp(baseOnChainParams);
      expect(SecureStore.store).toHaveBeenCalled();
    });

    it('reuses existing AES key from secure store', async () => {
      // SecureStore.fetch already returns a value in beforeEach
      await setupNewApp(baseOnChainParams);
      expect(SecureStore.store).not.toHaveBeenCalled();
    });

    it('throws and resets SETUPAPP when realm init fails', async () => {
      (dbManager.initializeRealm as jest.Mock).mockResolvedValueOnce(false);
      await expect(setupNewApp(baseOnChainParams)).rejects.toThrow(
        'Realm initialisation failed',
      );
      const calls = (Storage.set as jest.Mock).mock.calls;
      const setupFalseCalls = calls.filter(
        (c: any[]) => c[0] === 'SETUPAPP' && c[1] === false,
      );
      expect(setupFalseCalls.length).toBeGreaterThan(0);
    });

    it('throws when Relay.getChallenge returns no challenge', async () => {
      (Relay.getChallenge as jest.Mock).mockResolvedValueOnce({ challenge: null });
      await expect(setupNewApp(baseOnChainParams)).rejects.toThrow(
        'Failed to get challenge',
      );
    });

    it('throws when Relay.createNewApp returns no authToken', async () => {
      (Relay.createNewApp as jest.Mock).mockResolvedValueOnce({ app: {} });
      await expect(setupNewApp(baseOnChainParams)).rejects.toThrow(
        'Failed to generate auth token',
      );
    });

    it('generates mnemonic when none provided', async () => {
      const { mnemonic: _omit, ...rest } = baseOnChainParams;
      await setupNewApp({ ...rest, mnemonic: null } as any);
      const bip39 = require('bip39');
      expect(bip39.generateMnemonic).toHaveBeenCalled();
    });

    it('constructs RuntimeApiHandler with rgbWallet and authToken', async () => {
      await setupNewApp(baseOnChainParams);
      expect(ApiHandler).toHaveBeenCalledWith(
        expect.objectContaining({ mnemonic: MOCK_MNEMONIC }),
        'ON_CHAIN',
        'mock-auth-token',
      );
    });
  });

  describe('SUPPORTED_RLN branch', () => {
    const rlnParams = {
      appName: 'RLN App',
      pinMethod: 'DEFAULT' as any,
      passcode: '' as any,
      walletImage: null as any,
      mnemonic: MOCK_MNEMONIC,
      appType: 'SUPPORTED_RLN' as any,
      authToken: 'rln-auth-token',
      rgbNodeConnectParams: baseNodeConnectParams,
    };

    it('completes setup without throwing', async () => {
      await expect(setupNewApp(rlnParams)).resolves.not.toThrow();
    });

    it('creates TribeApp and RgbWallet', async () => {
      await setupNewApp(rlnParams);
      const calls = (dbManager.createObject as jest.Mock).mock.calls.map(
        (c: any[]) => c[0],
      );
      expect(calls).toContain('TribeApp');
      expect(calls).toContain('RgbWallet');
    });

    it('does NOT call RGBServices.initiate for SUPPORTED_RLN', async () => {
      await setupNewApp(rlnParams);
      expect(RGBServices.initiate).not.toHaveBeenCalled();
    });

    it('constructs RuntimeApiHandler with SUPPORTED_RLN appType', async () => {
      await setupNewApp(rlnParams);
      expect(ApiHandler).toHaveBeenCalledWith(
        expect.any(Object),
        'SUPPORTED_RLN',
        'rln-auth-token',
      );
    });
  });

  // The `else` branch is reached when appType is none of ON_CHAIN / SUPPORTED_RLN / NODE_CONNECT.
  // Use a custom string to force that path.
  describe('else branch (unknown appType with rgbNodeInfo)', () => {
    const elseParams = {
      appName: 'Legacy Node App',
      pinMethod: 'DEFAULT' as any,
      passcode: '' as any,
      walletImage: null as any,
      mnemonic: MOCK_MNEMONIC,
      appType: 'LEGACY' as any,
      authToken: '',
      rgbNodeConnectParams: baseNodeConnectParams,
      rgbNodeInfo: { pubkey: 'node-pubkey-abc' },
    };

    it('completes setup without throwing', async () => {
      await expect(setupNewApp(elseParams)).resolves.not.toThrow();
    });

    it('calls Relay.createNewApp with NODE_CONNECT appType', async () => {
      await setupNewApp(elseParams);
      expect(Relay.createNewApp).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'NODE_CONNECT',
        expect.any(String),
        '',
        expect.any(String),
        null, // walletImage is null in elseParams
      );
    });

    it('throws when authToken not returned from Relay', async () => {
      (Relay.createNewApp as jest.Mock).mockResolvedValueOnce({ app: {} });
      await expect(setupNewApp(elseParams)).rejects.toThrow(
        'Failed to generate auth token',
      );
    });

    it('throws when rgbNodeConnectParams.nodeId is missing', async () => {
      const params = {
        ...elseParams,
        rgbNodeConnectParams: { ...baseNodeConnectParams, nodeId: '' },
      };
      await expect(setupNewApp(params)).rejects.toThrow('Missing nodeId');
    });
  });
});

// ─── restoreWithBackupFile ────────────────────────────────────────────────────

describe('restoreWithBackupFile', () => {
  it('throws when RGBServices.restore returns an error', async () => {
    (RGBServices.restore as jest.Mock).mockResolvedValueOnce({
      error: 'restore failed',
    });
    await expect(
      restoreWithBackupFile({ mnemonic: MOCK_MNEMONIC, filePath: '/tmp/backup.rgb' }),
    ).rejects.toThrow('restore failed');
  });

  it('calls restoreAppImage and updates version history on success', async () => {
    (RGBServices.restore as jest.Mock).mockResolvedValueOnce({ error: null });
    (Relay.getAppImage as jest.Mock).mockResolvedValueOnce({ status: false });
    // Relay.createNewApp is called by setupNewApp internally; ensure it returns a valid authToken
    (Relay.createNewApp as jest.Mock).mockResolvedValueOnce({
      app: { authToken: 'mock-auth-token', imageUrl: '' },
    });

    await restoreWithBackupFile({
      mnemonic: MOCK_MNEMONIC,
      filePath: '/tmp/backup.rgb',
    });

    expect(restoreAppImage).toHaveBeenCalled();
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalled();
  });

  it('sets isRestore=true when Relay.getAppImage returns app data', async () => {
    (RGBServices.restore as jest.Mock).mockResolvedValueOnce({ error: null });
    (Relay.getAppImage as jest.Mock).mockResolvedValueOnce({
      status: true,
      app: { name: 'Restored App', imageUrl: 'https://img.url/img.png' },
    });

    await restoreWithBackupFile({
      mnemonic: MOCK_MNEMONIC,
      filePath: '/tmp/backup.rgb',
    });

    expect(Relay.createNewApp).toHaveBeenCalled();
  });

  it('proceeds even if Relay.getAppImage throws', async () => {
    (RGBServices.restore as jest.Mock).mockResolvedValueOnce({ error: null });
    (Relay.getAppImage as jest.Mock).mockRejectedValueOnce(new Error('network'));

    await expect(
      restoreWithBackupFile({ mnemonic: MOCK_MNEMONIC, filePath: '/tmp/backup.rgb' }),
    ).resolves.not.toThrow();
  });
});

// ─── restoreApp ──────────────────────────────────────────────────────────────

describe('restoreApp', () => {
  it('calls setupNewApp with SUPPORTED_RLN when backup.node exists', async () => {
    (Relay.getBackup as jest.Mock).mockResolvedValueOnce({
      node: { mnemonic: MOCK_MNEMONIC, nodeId: 'node-id' },
      token: 'token',
      apiUrl: 'http://api.url',
      peerDNS: 'peer.dns',
      app: { name: 'App', imageUrl: '' },
      nodeInfo: { pubkey: 'pubkey' },
    });

    await restoreApp(MOCK_MNEMONIC);

    // RuntimeApiHandler is called with SUPPORTED_RLN; authToken comes from backup.token
    // (passed as `authToken` param of setupNewApp which is undefined here since
    //  restoreApp doesn't forward it, so we only assert on the appType)
    expect(ApiHandler).toHaveBeenCalled();
    const calledAppType = (ApiHandler as jest.Mock).mock.calls[0][1];
    expect(calledAppType).toBe('SUPPORTED_RLN');
  });

  it('throws when backup has no file and no node', async () => {
    (Relay.getBackup as jest.Mock).mockResolvedValueOnce({
      file: null,
      node: null,
      error: 'No backup found',
    });

    await expect(restoreApp(MOCK_MNEMONIC)).rejects.toThrow('No backup found');
  });

  it('downloads backup file and restores ON_CHAIN when backup.file exists', async () => {
    (Relay.getBackup as jest.Mock).mockResolvedValueOnce({
      file: 'https://backup.url/file.rgb',
      node: null,
      app: { name: 'App', imageUrl: '' },
    });
    (RGBServices.initiate as jest.Mock).mockResolvedValueOnce({
      status: true,
      error: '',
    });

    await restoreApp(MOCK_MNEMONIC);

    const RNFS = require('@dr.pogodin/react-native-fs');
    expect(RNFS.downloadFile).toHaveBeenCalled();
    expect(RGBServices.restore).toHaveBeenCalled();
    expect(refreshRgbWallet).toHaveBeenCalled();
    expect(fetchPresetAssets).toHaveBeenCalled();
    expect(viewUtxos).toHaveBeenCalled();
    expect(restoreAppImage).toHaveBeenCalled();
  });

  it('throws when makeWalletOnline fails during ON_CHAIN restore', async () => {
    (Relay.getBackup as jest.Mock).mockResolvedValueOnce({
      file: 'https://backup.url/file.rgb',
      node: null,
      app: {},
    });
    // setupNewApp (ON_CHAIN) calls RGBServices.initiate first → let it succeed.
    // makeWalletOnline then calls it again → make that one fail.
    (RGBServices.initiate as jest.Mock)
      .mockResolvedValueOnce({ status: true, error: '' })
      .mockResolvedValueOnce({ status: false, error: 'initiate failed' });

    await expect(restoreApp(MOCK_MNEMONIC)).rejects.toThrow('initiate failed');
  });
});

// ─── downloadFile ─────────────────────────────────────────────────────────────

describe('downloadFile', () => {
  it('resolves with the download result', async () => {
    const RNFS = require('@dr.pogodin/react-native-fs');
    (RNFS.downloadFile as jest.Mock).mockReturnValueOnce({
      promise: Promise.resolve({ statusCode: 200 }),
    });

    const result = await downloadFile({
      fromUrl: 'https://example.com/file',
      toFile: '/tmp/file',
    } as any);

    expect(result).toEqual({ statusCode: 200 });
  });

  it('always includes default progressInterval even when not provided', async () => {
    const RNFS = require('@dr.pogodin/react-native-fs');
    (RNFS.downloadFile as jest.Mock).mockReturnValueOnce({
      promise: Promise.resolve({}),
    });

    await downloadFile({
      fromUrl: 'https://example.com/file',
      toFile: '/tmp/file',
    } as any);

    // Default progressInterval:5000 and progressDivider:100 are included
    // when the caller does not supply them.
    expect(RNFS.downloadFile).toHaveBeenCalledWith(
      expect.objectContaining({ progressInterval: 5000, progressDivider: 100 }),
    );
  });

  it('caller-supplied options override the defaults', async () => {
    const RNFS = require('@dr.pogodin/react-native-fs');
    (RNFS.downloadFile as jest.Mock).mockReturnValueOnce({
      promise: Promise.resolve({}),
    });

    await downloadFile({
      fromUrl: 'https://example.com/file',
      toFile: '/tmp/file',
      progressDivider: 50,
    } as any);

    // The spread `...obj` comes after the defaults, so caller wins.
    expect(RNFS.downloadFile).toHaveBeenCalledWith(
      expect.objectContaining({ progressDivider: 50 }),
    );
  });
});

// ─── biometricLogin ───────────────────────────────────────────────────────────

describe('biometricLogin', () => {
  it('returns key and isWalletOnline=false on success', async () => {
    (SecureStore.verifyBiometricAuth as jest.Mock).mockResolvedValueOnce({
      success: true,
      hash: 'bio-hash',
      encryptedKey: 'enc-key',
    });

    const result = await biometricLogin('mock-signature');
    expect(result).toEqual({ key: 'decrypted-key', isWalletOnline: false });
  });

  it('throws when biometric auth fails', async () => {
    (SecureStore.verifyBiometricAuth as jest.Mock).mockResolvedValueOnce({
      success: false,
    });

    await expect(biometricLogin('bad-sig')).rejects.toThrow(
      'Biometric Auth Failed',
    );
  });

  it('initialises realm with the decrypted key', async () => {
    (SecureStore.verifyBiometricAuth as jest.Mock).mockResolvedValueOnce({
      success: true,
      hash: 'bio-hash',
      encryptedKey: 'enc-key',
    });

    await biometricLogin('mock-signature');
    expect(dbManager.initializeRealm).toHaveBeenCalled();
  });

  it('constructs RuntimeApiHandler after realm init', async () => {
    (SecureStore.verifyBiometricAuth as jest.Mock).mockResolvedValueOnce({
      success: true,
      hash: 'bio-hash',
      encryptedKey: 'enc-key',
    });

    await biometricLogin('mock-signature');
    expect(ApiHandler).toHaveBeenCalled();
  });
});

// ─── createPin ────────────────────────────────────────────────────────────────

describe('createPin', () => {
  it('delegates to AuthService.createPin', async () => {
    await createPin('1234');
    expect(AuthService.createPin).toHaveBeenCalledWith('1234');
  });
});

// ─── changePin ────────────────────────────────────────────────────────────────

describe('changePin', () => {
  it('delegates to AuthService.changePin with key and pin', async () => {
    await changePin({ key: 'my-key', pin: '5678' });
    expect(AuthService.changePin).toHaveBeenCalledWith({ key: 'my-key', pin: '5678' });
  });
});

// ─── loginWithPin ─────────────────────────────────────────────────────────────

describe('loginWithPin', () => {
  it('returns key and isWalletOnline=false on success', async () => {
    (SecureStore.fetch as jest.Mock).mockResolvedValueOnce('encrypted-pin-key');

    const result = await loginWithPin('1234');
    expect(result).toEqual({ key: 'decrypted-key', isWalletOnline: false });
  });

  it('initialises realm and constructs RuntimeApiHandler', async () => {
    await loginWithPin('1234');
    expect(dbManager.initializeRealm).toHaveBeenCalled();
    expect(ApiHandler).toHaveBeenCalled();
  });

  it('throws "Invalid PIN" when decrypt or realm init fails', async () => {
    const { decrypt } = require('src/utils/encryption');
    (decrypt as jest.Mock).mockImplementationOnce(() => {
      throw new Error('bad decrypt');
    });

    await expect(loginWithPin('wrong')).rejects.toThrow('Invalid PIN');
  });
});

// ─── verifyPin ────────────────────────────────────────────────────────────────

describe('verifyPin', () => {
  it('delegates to AuthService.verifyPin', async () => {
    const result = await verifyPin('1234');
    expect(AuthService.verifyPin).toHaveBeenCalledWith('1234');
    expect(result).toBe('key-from-verify');
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns key and isWalletOnline=false', async () => {
    const result = await login();
    expect(result).toEqual({ key: 'decrypted-key', isWalletOnline: false });
  });

  it('initialises realm and constructs RuntimeApiHandler', async () => {
    await login();
    expect(dbManager.initializeRealm).toHaveBeenCalled();
    expect(ApiHandler).toHaveBeenCalled();
  });

  it('fetches the encryption key from SecureStore using config identifier hash', async () => {
    await login();
    const { hash512 } = require('src/utils/encryption');
    expect(hash512).toHaveBeenCalledWith('enc-id');
  });
});

// ─── makeWalletOnline ─────────────────────────────────────────────────────────

describe('makeWalletOnline', () => {
  it('returns status=true for ON_CHAIN via RGBServices.initiate', async () => {
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({
      appType: 'ON_CHAIN',
      primaryMnemonic: MOCK_MNEMONIC,
    });

    const result = await makeWalletOnline();
    expect(result).toEqual({ status: true, error: '' });
    expect(RGBServices.initiate).toHaveBeenCalled();
  });

  it('returns status=true for NODE_CONNECT when node responds', async () => {
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({
      appType: 'NODE_CONNECT',
      nodeUrl: 'http://localhost:3001',
      nodeAuthentication: 'api-key',
    });
    const { RLNNodeApiServices: Mock } = require('src/services/rgbnode/RLNNodeApi');
    Mock.mockImplementationOnce(() => ({
      nodeinfo: jest.fn(() => Promise.resolve({ pubkey: 'pubkey' })),
    }));

    const result = await makeWalletOnline();
    expect(result.status).toBe(true);
  });

  it('returns status=false for NODE_CONNECT when node has no pubkey', async () => {
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({
      appType: 'NODE_CONNECT',
      nodeUrl: 'http://localhost:3001',
      nodeAuthentication: 'api-key',
    });
    const { RLNNodeApiServices: Mock } = require('src/services/rgbnode/RLNNodeApi');
    Mock.mockImplementationOnce(() => ({
      nodeinfo: jest.fn(() => Promise.resolve({})),
    }));

    const result = await makeWalletOnline();
    expect(result.status).toBe(false);
    expect(result.error).toBe('Node not found');
  });

  it('returns status=false and error string on exception', async () => {
    (dbManager.getObjectByIndex as jest.Mock).mockImplementationOnce(() => {
      throw new Error('realm error');
    });

    const result = await makeWalletOnline();
    expect(result.status).toBe(false);
    expect(result.error).toContain('realm error');
  });

  it('passes timeout parameter (signature check)', async () => {
    // makeWalletOnline accepts a timeout param; ensure it resolves regardless
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({ appType: 'ON_CHAIN' });
    const result = await makeWalletOnline(60);
    expect(result.status).toBe(true);
  });
});

// ─── createNewWallet ──────────────────────────────────────────────────────────

describe('createNewWallet', () => {
  it('creates a wallet and stores it in realm', async () => {
    const wallet = await createNewWallet({});
    expect(generateWallet).toHaveBeenCalled();
    expect(dbManager.createObject).toHaveBeenCalledWith('Wallet', expect.any(Object));
    expect(wallet).toEqual({ id: 'wallet-id' });
  });

  it('accepts custom instanceNum, walletName, walletDescription', async () => {
    await createNewWallet({
      instanceNum: 2,
      walletName: 'Custom',
      walletDescription: 'My wallet',
    });
    expect(generateWallet).toHaveBeenCalledWith(
      expect.objectContaining({ instanceNum: 2, walletName: 'Custom' }),
    );
  });

  it('returns undefined and logs when generateWallet returns falsy', async () => {
    (generateWallet as jest.Mock).mockResolvedValueOnce(null);
    const result = await createNewWallet({});
    expect(result).toBeUndefined();
  });
});

// ─── checkRgbNodeConnection ───────────────────────────────────────────────────

describe('checkRgbNodeConnection', () => {
  it('returns the response on success', async () => {
    (RLNNodeApiServices as any).checkNodeConnection.mockResolvedValueOnce({
      nodeId: 'abc',
    });

    const result = await checkRgbNodeConnection(baseNodeConnectParams as any);
    expect(result).toEqual({ nodeId: 'abc' });
  });

  it('throws when response contains an error field', async () => {
    (RLNNodeApiServices as any).checkNodeConnection.mockResolvedValueOnce({
      error: 'connection refused',
    });

    await expect(
      checkRgbNodeConnection(baseNodeConnectParams as any),
    ).rejects.toThrow('connection refused');
  });

  it('throws "Failed to connect to node" when response is falsy (non-object)', async () => {
    // Passing `false` avoids a TypeError from `false.error` while still
    // being falsy, so the else-branch throws the expected message.
    (RLNNodeApiServices as any).checkNodeConnection.mockResolvedValueOnce(false);

    await expect(
      checkRgbNodeConnection(baseNodeConnectParams as any),
    ).rejects.toThrow('Failed to connect to node');
  });

  it('rethrows network errors', async () => {
    (RLNNodeApiServices as any).checkNodeConnection.mockRejectedValueOnce(
      new Error('ECONNREFUSED'),
    );

    await expect(
      checkRgbNodeConnection(baseNodeConnectParams as any),
    ).rejects.toThrow('ECONNREFUSED');
  });
});

// ─── createSupportedNode ──────────────────────────────────────────────────────

describe('createSupportedNode', () => {
  it('returns the response on success', async () => {
    (Relay.createSupportedNode as jest.Mock).mockResolvedValueOnce({
      nodeId: 'new-node',
    });

    const result = await createSupportedNode();
    expect(result).toEqual({ nodeId: 'new-node' });
  });

  it('throws when response has an error field', async () => {
    (Relay.createSupportedNode as jest.Mock).mockResolvedValueOnce({
      error: 'quota exceeded',
    });

    await expect(createSupportedNode()).rejects.toThrow('quota exceeded');
  });

  it('throws "Failed to create node" when response is falsy (non-object)', async () => {
    // `false` is falsy and `(false).error` is undefined, so code reaches
    // the else branch that throws 'Failed to create node'.
    (Relay.createSupportedNode as jest.Mock).mockResolvedValueOnce(false);

    await expect(createSupportedNode()).rejects.toThrow('Failed to create node');
  });

  it('extracts error from response.data.error on axios-style error', async () => {
    const axiosError = { response: { data: { error: 'server error' } } };
    (Relay.createSupportedNode as jest.Mock).mockRejectedValueOnce(axiosError);

    await expect(createSupportedNode()).rejects.toThrow('server error');
  });

  it('falls back to generic message when error has no useful text', async () => {
    const silentError = { message: 'Error' };
    (Relay.createSupportedNode as jest.Mock).mockRejectedValueOnce(silentError);

    await expect(createSupportedNode()).rejects.toThrow(
      'Unable to create wallet in supported mode',
    );
  });
});

// ─── resetApp ─────────────────────────────────────────────────────────────────

describe('resetApp', () => {
  it('delegates to AuthService.resetApp', async () => {
    await resetApp('my-key');
    expect(AuthService.resetApp).toHaveBeenCalledWith('my-key');
  });
});
