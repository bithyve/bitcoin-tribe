jest.mock('realm', () => ({
  UpdateMode: {
    Modified: 'modified',
    All: 'all',
  },
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  writeFile: jest.fn(),
  exists: jest.fn(),
  copyFile: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-1'),
}));

jest.mock('src/storage', () => ({
  Keys: {},
  Storage: {
    set: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    NETWORK_TYPE: 'testnet',
  },
}));

jest.mock('src/utils/DeepLinking', () => {
  const deepLinking = {
    appLinkScheme: 'tribe://',
    processDeepLink: jest.fn(() => ({ isValid: false })),
    buildUrl: jest.fn(() => 'tribe://mock'),
  };
  return {
    __esModule: true,
    default: deepLinking,
    DeepLinkFeature: {
      COLLECTION: 'COLLECTION',
      COLLECTION_ITEM: 'COLLECTION_ITEM',
    },
    DeepLinkType: {
      APP_LINK: 'APP_LINK',
    },
  };
});

jest.mock('src/services/rgbnode/RLNNodeApi', () => ({
  RLNNodeApiServices: jest.fn().mockImplementation(() => ({
    lninvoice: jest.fn(),
    decodelninvoice: jest.fn(),
    sendPayment: jest.fn(),
    listpayments: jest.fn(),
    getassetmedia: jest.fn(),
    assetbalance: jest.fn(),
  })),
}));

jest.mock('../src/services/handler/services/WalletServices', () => ({
  createUtxos: jest.fn(),
  updateTransaction: jest.fn(),
  viewUtxos: jest.fn(),
}));

jest.mock('../src/services/handler/services/backupService', () => ({
  backup: jest.fn(),
  backupAppImage: jest.fn(),
}));

jest.mock('src/services/rgb/RGBServices', () => ({
  receiveAsset: jest.fn(),
  addInvoiceToWatchTower: jest.fn(),
  isGasFreeAvailable: jest.fn(),
  syncRgbAssets: jest.fn(),
  requestGasFreeQuote: jest.fn(),
  confirmGasFreeTransfer: jest.fn(),
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getObjectByIndex: jest.fn(),
    updateObjectByPrimaryId: jest.fn(),
    createObject: jest.fn(),
    getObjectByPrimaryId: jest.fn(),
    createObjectBulk: jest.fn(),
    getCollection: jest.fn(),
    updateObjectById: jest.fn(),
  },
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('src/components/Toast', () => jest.fn());

jest.mock('src/services/twitter', () => ({
  fetchAndVerifyTweet: jest.fn(),
}));

jest.mock('orbis1-sdk-rn', () => ({
  RgbLibErrors: {
    InsufficientAllocationSlots: 'InsufficientAllocationSlots',
  },
}));

import RGBServices from 'src/services/rgb/RGBServices';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
import {
  isGasFreeAvailable,
  receiveAsset,
  resetRgbWalletServicesTestDeps,
  setRgbWalletServicesTestDeps,
} from '../src/services/handler/services/RgbWalletServices';

describe('RgbWalletServices', () => {
  const mockDeps = {
    createUtxos: jest.fn(),
    updateTransaction: jest.fn(),
    viewUtxos: jest.fn(),
    backup: jest.fn(),
    backupAppImage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setRgbWalletServicesTestDeps(mockDeps as any);

    (dbManager.getObjectByIndex as jest.Mock).mockImplementation((schema: string) => {
      if (schema === RealmSchema.TribeApp) {
        return { appType: AppType.ON_CHAIN };
      }
      if (schema === RealmSchema.RgbWallet) {
        return { mnemonic: 'mnemonic-1', invoices: [] };
      }
      return {};
    });
  });

  afterEach(() => {
    resetRgbWalletServicesTestDeps();
  });

  it('delegates gas-free availability check', () => {
    (RGBServices.isGasFreeAvailable as jest.Mock).mockReturnValue(true);

    const result = isGasFreeAvailable();

    expect(result).toBe(true);
    expect(RGBServices.isGasFreeAvailable).toHaveBeenCalledTimes(1);
  });

  it('receives asset and updates invoices using injected deps', async () => {
    (RGBServices.receiveAsset as jest.Mock).mockResolvedValue({
      invoice: 'invoice-1',
      recipientId: 'recipient-1',
      batchTransferIdx: 1,
      expirationTimestamp: 123,
    });
    (RGBServices.addInvoiceToWatchTower as jest.Mock).mockResolvedValue({
      success: true,
    });
    mockDeps.backupAppImage.mockResolvedValue({ status: true });

    const result = await receiveAsset({
      assetId: 'asset-1',
      amount: '1',
      linkedAsset: null,
      linkedAmount: 0,
      expiry: 3600,
      blinded: true,
      useWatchTower: true,
    });

    expect(result.invoice).toBe('invoice-1');
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      RealmSchema.RgbWallet,
      'mnemonic',
      'mnemonic-1',
      expect.objectContaining({
        invoices: expect.any(Array),
      }),
    );
    expect(mockDeps.backupAppImage).toHaveBeenCalledWith({ invoices: true });
    expect(mockDeps.viewUtxos).toHaveBeenCalledTimes(1);
  });

  it('retries receiveAsset after creating utxos on allocation slot error', async () => {
    (RGBServices.receiveAsset as jest.Mock)
      .mockRejectedValueOnce({ code: 'InsufficientAllocationSlots' })
      .mockResolvedValueOnce({
        invoice: 'invoice-2',
        recipientId: 'recipient-2',
      });
    mockDeps.createUtxos.mockResolvedValue(true);
    mockDeps.backupAppImage.mockResolvedValue({ status: true });

    const result = await receiveAsset({
      assetId: 'asset-2',
      amount: '2',
      linkedAsset: null,
      linkedAmount: 0,
      expiry: 3600,
      blinded: true,
      useWatchTower: false,
    });

    expect(result.invoice).toBe('invoice-2');
    expect(mockDeps.createUtxos).toHaveBeenCalledTimes(1);
    expect(RGBServices.receiveAsset).toHaveBeenCalledTimes(2);
  });
});
