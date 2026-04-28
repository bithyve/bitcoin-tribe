import { it, expect, describe, jest, beforeEach } from '@jest/globals';

// Mock react-native-config before importing anything that depends on it
jest.mock('react-native-config', () => ({
  ENVIRONMENT: 'PRODUCTION',
}));

import Deeplinking, { DeepLinkFeature } from '../src/utils/DeepLinking';

// Mock dbManager for ApiHandler tests
const mockGetCollection = jest.fn();
const mockCreateObject = jest.fn();
jest.mock('../src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getCollection: mockGetCollection,
    createObject: mockCreateObject,
    getObjectByIndex: jest.fn(),
    getObjectByPrimaryId: jest.fn(),
  },
}));

import { ApiHandler } from '../src/services/handler/apiHandler';
import { Asset } from '../src/models/interfaces/RGBWallet';

describe('Deeplinking.processDeepLink — registry URLs', () => {
  const prodScheme = 'https://bitcointribe.app/app/prod';
  const appScheme = 'tribe://';

  it('returns valid=true with registry feature and assetId from universal link', () => {
    const url = `${prodScheme}/registry?assetId=rgb:abc123`;
    const result = Deeplinking.processDeepLink(url);
    expect(result.isValid).toBe(true);
    expect(result.feature).toBe(DeepLinkFeature.REGISTRY);
    expect(result.params?.assetId).toBe('rgb:abc123');
  });

  it('returns valid=true with registry feature and assetId from app-link scheme', () => {
    const url = `${appScheme}registry?assetId=rgb:xyz789`;
    const result = Deeplinking.processDeepLink(url);
    expect(result.isValid).toBe(true);
    expect(result.feature).toBe(DeepLinkFeature.REGISTRY);
    expect(result.params?.assetId).toBe('rgb:xyz789');
  });

  it('returns valid=true but empty params when assetId is missing', () => {
    const url = `${prodScheme}/registry`;
    const result = Deeplinking.processDeepLink(url);
    expect(result.isValid).toBe(true);
    expect(result.feature).toBe(DeepLinkFeature.REGISTRY);
    expect(result.params?.assetId).toBeUndefined();
  });

  it('returns valid=false for an unknown scheme', () => {
    const url = 'https://example.com/registry?assetId=rgb:abc';
    const result = Deeplinking.processDeepLink(url);
    expect(result.isValid).toBe(false);
  });

  it('returns valid=false for an empty string', () => {
    const result = Deeplinking.processDeepLink('');
    expect(result.isValid).toBe(false);
  });
});

describe('ApiHandler.addAssetFromRegistry', () => {
  const mockAsset: Partial<Asset> = {
    assetId: 'rgb:test-asset-id',
    name: 'Test Coin',
    ticker: 'TST',
  };

  beforeEach(() => {
    mockGetCollection.mockReset();
    mockCreateObject.mockReset();
  });

  it('returns { status: true, alreadyExists: true } when coin already exists', async () => {
    mockGetCollection.mockReturnValue([{ assetId: 'rgb:test-asset-id' }]);
    const result = await ApiHandler.addAssetFromRegistry({ asset: mockAsset as Asset });
    expect(result.status).toBe(true);
    expect(result.alreadyExists).toBe(true);
    expect(mockCreateObject).not.toHaveBeenCalled();
  });

  it('returns { status: true, alreadyExists: false } when coin is new', async () => {
    mockGetCollection.mockReturnValue([]);
    mockCreateObject.mockReturnValue(undefined);
    const result = await ApiHandler.addAssetFromRegistry({ asset: mockAsset as Asset });
    expect(result.status).toBe(true);
    expect(result.alreadyExists).toBe(false);
    expect(mockCreateObject).toHaveBeenCalled();
  });

  it('throws when dbManager.createObject throws', async () => {
    mockGetCollection.mockReturnValue([]);
    mockCreateObject.mockImplementation(() => {
      throw new Error('DB error');
    });
    await expect(
      ApiHandler.addAssetFromRegistry({ asset: mockAsset as Asset }),
    ).rejects.toThrow('DB error');
  });
});
