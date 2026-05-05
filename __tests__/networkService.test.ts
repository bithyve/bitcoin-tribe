jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    NETWORK_TYPE: 'testnet',
  },
}));

jest.mock('src/services/wallets/enums', () => ({
  NetworkType: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    REGTEST: 'regtest',
    TESTNET4: 'testnet4',
  },
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: jest.fn(() => '1.2.3'),
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    updateObjectByPrimaryId: jest.fn(),
  },
}));

jest.mock('src/storage/enum', () => ({
  RealmSchema: {
    VersionHistory: 'VersionHistory',
  },
}));

jest.mock('orbis1-sdk-rn', () => ({
  BitcoinNetwork: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    REGTEST: 'regtest',
    TESTNET4: 'testnet4',
  },
}));

import config from 'src/utils/config';
import dbManager from 'src/storage/realm/dbManager';
import { NetworkService } from '../src/services/handler/services/networkService';

describe('NetworkService', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = mockFetch;
  });

  it('maps each supported network type to the bitcoin network enum', () => {
    config.NETWORK_TYPE = 'mainnet';
    expect(NetworkService.getBitcoinNetwork()).toBe('mainnet');

    config.NETWORK_TYPE = 'testnet';
    expect(NetworkService.getBitcoinNetwork()).toBe('testnet');

    config.NETWORK_TYPE = 'regtest';
    expect(NetworkService.getBitcoinNetwork()).toBe('regtest');

    config.NETWORK_TYPE = 'testnet4';
    expect(NetworkService.getBitcoinNetwork()).toBe('testnet4');
  });

  it('falls back to testnet for unknown network types', () => {
    config.NETWORK_TYPE = 'unknown' as any;

    expect(NetworkService.getBitcoinNetwork()).toBe('testnet');
  });

  it('returns the correct electrum URL for each network', () => {
    expect(NetworkService.getElectrumUrl('testnet' as any)).toBe(
      'ssl://electrum.iriswallet.com:50013',
    );
    expect(NetworkService.getElectrumUrl('testnet4' as any)).toBe(
      'ssl://electrum.iriswallet.com:50053',
    );
    expect(NetworkService.getElectrumUrl('regtest' as any)).toBe(
      'electrum.rgbtools.org:50041',
    );
    expect(NetworkService.getElectrumUrl('mainnet' as any)).toBe(
      'ssl://electrum.iriswallet.com:50003',
    );
  });

  it('loadGithubReleaseNotes updates version history when the release exists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({ body: 'release notes' })),
    });

    const result = await NetworkService.loadGithubReleaseNotes('1.2.3(45)');

    expect(result).toEqual({ releaseNote: 'release notes' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v1.2.3',
    );
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      'VersionHistory',
      'version',
      '1.2.3(45)',
      { releaseNote: 'release notes' },
    );
  });

  it('loadGithubReleaseNotes returns an empty note for non-ok responses', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(NetworkService.loadGithubReleaseNotes('1.2.3(45)')).resolves.toEqual({
      releaseNote: '',
    });
  });

  it('loadGithubReleaseNotes returns an empty note when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    await expect(NetworkService.loadGithubReleaseNotes('1.2.3(45)')).resolves.toEqual({
      releaseNote: '',
    });
  });

  it('fetchGithubRelease returns release notes for the current app version', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({ body: 'current release' })),
    });

    await expect(NetworkService.fetchGithubRelease()).resolves.toEqual({
      releaseNote: 'current release',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v1.2.3',
    );
  });

  it('fetchGithubRelease returns an empty note when the release is missing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(NetworkService.fetchGithubRelease()).resolves.toEqual({
      releaseNote: '',
    });
  });

  it('fetchGithubRelease returns an empty note when fetch throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('boom'));

    await expect(NetworkService.fetchGithubRelease()).resolves.toEqual({
      releaseNote: '',
    });
  });
});