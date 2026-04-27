jest.mock('src/storage', () => ({
  Keys: {},
  Storage: {
    set: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getObjectByIndex: jest.fn(),
    getCollection: jest.fn(() => []),
    createObject: jest.fn(),
    updateObjectByPrimaryId: jest.fn(),
  },
}));

jest.mock('src/storage/realm/realm', () => ({
  __esModule: true,
  default: {
    createBulk: jest.fn(),
  },
}));

jest.mock('src/storage/realm/utils', () => ({
  getJSONFromRealmObject: jest.fn(() => ({ specs: { transactions: [] } })),
}));

jest.mock('src/utils/encryption', () => ({
  decrypt: jest.fn(),
  encrypt: jest.fn(),
  generateEncryptionKey: jest.fn(() => 'enc-key'),
}));

jest.mock('src/services/rgb/RGBServices', () => ({
  __esModule: true,
  default: {
    restore: jest.fn(),
    backup: jest.fn(),
    isBackupRequired: jest.fn(),
  },
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    createAppImageBackup: jest.fn(),
  },
}));

jest.mock('src/services/backup/rgbCloudBackup', () => ({
  backupRgbOnCloudWithBanners: jest.fn(),
}));

import {
  backup,
  backupAppImage,
  backupRgbOnCloud,
  createBackup,
  isBackupRequired,
  resetBackupServiceTestDeps,
  setBackupServiceTestDeps,
} from '../src/services/handler/services/backupService';

describe('backupService wrappers', () => {
  const mockDeps = {
    restoreRgbFromCloud: jest.fn(),
    backupRgbOnCloud: jest.fn(),
    createBackup: jest.fn(),
    backup: jest.fn(),
    isBackupRequired: jest.fn(),
    backupAppImage: jest.fn(),
    restoreAppImage: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    setBackupServiceTestDeps(mockDeps);
  });

  afterEach(() => {
    resetBackupServiceTestDeps();
  });

  it('delegates backupRgbOnCloud', async () => {
    mockDeps.backupRgbOnCloud.mockResolvedValue({ ok: true });

    const result = await backupRgbOnCloud();

    expect(result).toEqual({ ok: true });
    expect(mockDeps.backupRgbOnCloud).toHaveBeenCalledTimes(1);
  });

  it('delegates createBackup', async () => {
    mockDeps.createBackup.mockResolvedValue(true);

    const result = await createBackup(true);

    expect(result).toBe(true);
    expect(mockDeps.createBackup).toHaveBeenCalledWith(true);
  });

  it('delegates backup', async () => {
    mockDeps.backup.mockResolvedValue(undefined);

    await backup();

    expect(mockDeps.backup).toHaveBeenCalledTimes(1);
  });

  it('delegates isBackupRequired', async () => {
    mockDeps.isBackupRequired.mockResolvedValue(false);

    const result = await isBackupRequired();

    expect(result).toBe(false);
    expect(mockDeps.isBackupRequired).toHaveBeenCalledTimes(1);
  });

  it('delegates backupAppImage with normalized payload', async () => {
    mockDeps.backupAppImage.mockResolvedValue({ status: true });

    const result = await backupAppImage({
      settings: true,
      room: null,
      all: false,
      tnxMeta: { txid: 'tx-1', metaData: { note: 'n' } },
      invoices: true,
    });

    expect(result).toEqual({ status: true });
    expect(mockDeps.backupAppImage).toHaveBeenCalledWith({
      settings: true,
      room: null,
      all: false,
      tnxMeta: { txid: 'tx-1', metaData: { note: 'n' } },
      invoices: true,
    });
  });
});
