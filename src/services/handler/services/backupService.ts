import { NativeModules, Platform } from 'react-native';
import { BackupAction, CloudBackupAction } from 'src/models/enums/Backup';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { Keys, Storage } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import RealmDatabase from 'src/storage/realm/realm';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { decrypt, encrypt, generateEncryptionKey } from 'src/utils/encryption';
import RGBServices from 'src/services/rgb/RGBServices';
import Relay from 'src/services/relay';
import { backupRgbOnCloudWithBanners } from 'src/services/backup/rgbCloudBackup';
import { TribeApp } from 'src/models/interfaces/TribeApp';

export class BackupService {
  static async restoreRgbFromCloud(refreshRgbWallet: () => Promise<void>) {
    const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
    if (Platform.OS === 'android') {
      await NativeModules.CloudBackup.setup();
      const login = JSON.parse(await NativeModules.CloudBackup.login());
      if (login.status) {
        const restore = await RGBServices.restore(app.primaryMnemonic);
        console.log(restore);
        if (restore) {
          await refreshRgbWallet();
        }
      }
      return;
    }

    const restore = await RGBServices.restore(app.primaryMnemonic);
    if (restore) {
      await refreshRgbWallet();
    }
    console.log(restore);
  }

  static async backupRgbOnCloud() {
    const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
    const isBackupRequired = true;
    if (!isBackupRequired) {
      return;
    }

    if (Platform.OS === 'android') {
      await NativeModules.CloudBackup.setup();
      const login = JSON.parse(await NativeModules.CloudBackup.login());
      if (login.status) {
        const backup = await RGBServices.backup('', app.primaryMnemonic, app.publicId);
        if (backup.error) {
          dbManager.createObject(RealmSchema.CloudBackupHistory, {
            title: CloudBackupAction.CLOUD_BACKUP_FAILED,
            date: new Date().toString(),
            confirmed: true,
            subtitle: backup.error,
          });
        } else {
          dbManager.createObject(RealmSchema.CloudBackupHistory, {
            title: CloudBackupAction.CLOUD_BACKUP_CREATED,
            date: new Date().toString(),
            confirmed: true,
            subtitle: backup.file,
          });
        }
      } else {
        dbManager.createObject(RealmSchema.CloudBackupHistory, {
          title: CloudBackupAction.CLOUD_BACKUP_FAILED,
          date: new Date().toString(),
          confirmed: true,
          subtitle: login.error,
        });
      }
      return;
    }

    const backup = await RGBServices.backup('', app.primaryMnemonic, app.publicId);
    if (backup.error) {
      dbManager.createObject(RealmSchema.CloudBackupHistory, {
        title: CloudBackupAction.CLOUD_BACKUP_FAILED,
        date: new Date().toString(),
        confirmed: true,
        subtitle: backup.error,
      });
    } else {
      dbManager.createObject(RealmSchema.CloudBackupHistory, {
        title: CloudBackupAction.CLOUD_BACKUP_CREATED,
        date: new Date().toString(),
        confirmed: true,
        subtitle: backup.file,
      });
    }
  }

  static async createBackup(confirmed: boolean) {
    dbManager.createObject(RealmSchema.BackupHistory, {
      title: confirmed
        ? BackupAction.SEED_BACKUP_CONFIRMED
        : BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED,
      date: new Date().toString(),
      confirmed,
      subtitle: '',
    });
    return true;
  }

  static async backup() {
    await backupRgbOnCloudWithBanners();
  }

  static async isBackupRequired() {
    return RGBServices.isBackupRequired();
  }

  static async backupAppImage({
    settings = false,
    room = null,
    all = false,
    tnxMeta = null,
    invoices = false,
  }: {
    settings?: boolean;
    room?: null | any;
    all?: boolean;
    tnxMeta?: null | { txid: string; metaData: object };
    invoices?: boolean;
  }) {
    Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, false);
    try {
      const app: any = dbManager.getCollection(RealmSchema.TribeApp)[0];
      const encryptionKey = generateEncryptionKey(app.primaryMnemonic);
      let settingsObject: string = '';
      const roomsObject: Record<string, string> = {};
      const tnxMetaObject: Record<string, string> = {};
      let invoicesObject: string | undefined;

      if (all || settings) {
        const keys = [Keys.APP_CURRENCY, Keys.APP_LANGUAGE, Keys.CURRENCY_MODE];

        const settingsData = Object.fromEntries(
          keys
            .map(key => [key, Storage.get(key)])
            .filter(([, value]) => value !== undefined && value !== null),
        );
        settingsObject = encrypt(encryptionKey, JSON.stringify(settingsData));
      }

      if (all) {
        const rooms = dbManager.getCollection(RealmSchema.HolepunchRoom);
        for (const index in rooms) {
          const currentRoom = rooms[index];
          const encryptedRoom = encrypt(encryptionKey, JSON.stringify(currentRoom));
          const encryptedRoomId = encrypt(encryptionKey, currentRoom.roomId);
          roomsObject[encryptedRoomId] = encryptedRoom;
        }

        const transactions = getJSONFromRealmObject(
          dbManager.getObjectByIndex(RealmSchema.Wallet),
        ).specs?.transactions;
        for (const tnx of transactions) {
          if (Object.keys(tnx.metadata).length) {
            const encryptedMeta = encrypt(
              encryptionKey,
              JSON.stringify(tnx.metadata),
            );
            tnxMetaObject[tnx.txid] = encryptedMeta;
          }
        }
      } else {
        if (room) {
          const encryptedRoom = encrypt(encryptionKey, JSON.stringify(room));
          const encryptedRoomId = encrypt(encryptionKey, room.roomId);
          roomsObject[encryptedRoomId] = encryptedRoom;
        }
        if (tnxMeta?.txid && tnxMeta?.metaData) {
          const encryptedMeta = encrypt(
            encryptionKey,
            JSON.stringify(tnxMeta.metaData),
          );
          tnxMetaObject[tnxMeta.txid] = encryptedMeta;
        }
      }

      if (all || invoices) {
        const rgbWallet = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        ) as RGBWallet;
        invoicesObject = encrypt(
          encryptionKey,
          JSON.stringify(rgbWallet?.invoices ?? []),
        );
      }

      await Relay.createAppImageBackup(
        app.authToken,
        roomsObject,
        settingsObject,
        tnxMetaObject,
        invoicesObject,
      );
      return {
        status: true,
        message: 'App image backup created successfully',
      };
    } catch (err) {
      Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, true);
      console.log('backupAppImage error:', err);
      return {
        status: false,
        message: 'App image backup failed',
      };
    }
  }

  static async restoreAppImage({
    mnemonic,
    settingsObject,
    roomsObject,
    tnxMetaObject,
    invoicesObject,
    refreshWallets,
  }: {
    mnemonic: string;
    settingsObject?: string;
    roomsObject?: object;
    tnxMetaObject?: object;
    invoicesObject?: string;
    refreshWallets: (args: { wallets: any; metaData: object }) => Promise<any>;
  }) {
    const encryptionKey = generateEncryptionKey(mnemonic);
    try {
      if (settingsObject) {
        const decrypted = decrypt(encryptionKey, settingsObject);
        const decryptedData = JSON.parse(decrypted);
        Object.entries(decryptedData).forEach(([key, value]: [any, any]) => {
          Storage.set(key, value);
        });
      }
      const rooms: any[] = [];
      if (roomsObject) {
        Object.entries(roomsObject).forEach(([, value]: [string, any]) => {
          const decryptedData = JSON.parse(decrypt(encryptionKey, value));
          rooms.push(decryptedData);
        });
        RealmDatabase.createBulk(RealmSchema.HolepunchRoom, rooms, 'modified');
      }
      if (tnxMetaObject) {
        const decryptedData: Record<string, any> = {};
        Object.entries(tnxMetaObject).forEach(([key, value]) => {
          const decryptedValue = JSON.parse(decrypt(encryptionKey, value as string));
          decryptedData[key] = decryptedValue;
        });
        await refreshWallets({
          wallets: dbManager.getCollection(RealmSchema.Wallet),
          metaData: decryptedData,
        });
      }
      if (invoicesObject) {
        const decryptedInvoices = JSON.parse(
          decrypt(encryptionKey, invoicesObject),
        );
        if (!Array.isArray(decryptedInvoices)) {
          throw new Error('Invalid invoices backup payload');
        }
        const rgbWallet = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        ) as RGBWallet;
        if (rgbWallet?.mnemonic) {
          dbManager.updateObjectByPrimaryId(
            RealmSchema.RgbWallet,
            'mnemonic',
            rgbWallet.mnemonic,
            { invoices: decryptedInvoices },
          );
        }
      }
    } catch (error) {
      console.log('AppRestoreFailed:', error);
    }

    if (settingsObject || roomsObject || tnxMetaObject || invoicesObject) {
      Storage.set(Keys.FIRST_APP_IMAGE_BACKUP_COMPLETE, true);
    }
  }
}

type BackupServiceWrapperDeps = {
  restoreRgbFromCloud: (refreshRgbWallet: () => Promise<void>) => Promise<any>;
  backupRgbOnCloud: () => Promise<any>;
  createBackup: (confirmed: boolean) => Promise<any>;
  backup: () => Promise<any>;
  isBackupRequired: () => Promise<any>;
  backupAppImage: (args: {
    settings?: boolean;
    room?: null | any;
    all?: boolean;
    tnxMeta?: null | { txid: string; metaData: object };
    invoices?: boolean;
  }) => Promise<any>;
  restoreAppImage: (args: {
    mnemonic: string;
    settingsObject?: string;
    roomsObject?: object;
    tnxMetaObject?: object;
    invoicesObject?: string;
    refreshWallets: (args: { wallets: any; metaData: object }) => Promise<any>;
  }) => Promise<any>;
};

function createBackupWrapperDeps(): BackupServiceWrapperDeps {
  return {
    restoreRgbFromCloud: BackupService.restoreRgbFromCloud,
    backupRgbOnCloud: BackupService.backupRgbOnCloud,
    createBackup: BackupService.createBackup,
    backup: BackupService.backup,
    isBackupRequired: BackupService.isBackupRequired,
    backupAppImage: BackupService.backupAppImage,
    restoreAppImage: BackupService.restoreAppImage,
  };
}

let backupWrapperDeps: BackupServiceWrapperDeps = createBackupWrapperDeps();

export function setBackupServiceTestDeps(
  overrides: Partial<BackupServiceWrapperDeps>,
) {
  backupWrapperDeps = {
    ...backupWrapperDeps,
    ...overrides,
  };
}

export function resetBackupServiceTestDeps() {
  backupWrapperDeps = createBackupWrapperDeps();
}

export async function restoreRgbFromCloud() {
  const { refreshRgbWallet } = await import('./RgbWalletServices');
  return backupWrapperDeps.restoreRgbFromCloud(refreshRgbWallet);
}

export async function backupRgbOnCloud() {
  return backupWrapperDeps.backupRgbOnCloud();
}

export async function createBackup(confirmed: boolean) {
  return backupWrapperDeps.createBackup(confirmed);
}

export async function backup() {
  return backupWrapperDeps.backup();
}

export async function isBackupRequired() {
  return backupWrapperDeps.isBackupRequired();
}

export async function backupAppImage({
  settings = false,
  room = null,
  all = false,
  tnxMeta = null,
  invoices = false,
}: {
  settings?: boolean;
  room?: null | any;
  all?: boolean;
  tnxMeta?: null | { txid: string; metaData: object };
  invoices?: boolean;
}) {
  return backupWrapperDeps.backupAppImage({
    settings,
    room,
    all,
    tnxMeta,
    invoices,
  });
}

export async function restoreAppImage({
  mnemonic,
  settingsObject,
  roomsObject,
  tnxMetaObject,
  invoicesObject,
}: {
  mnemonic: string;
  settingsObject?: string;
  roomsObject?: object;
  tnxMetaObject?: object;
  invoicesObject?: string;
}) {
  const { refreshWallets } = await import('./WalletServices');
  return backupWrapperDeps.restoreAppImage({
    mnemonic,
    settingsObject,
    roomsObject,
    tnxMetaObject,
    invoicesObject,
    refreshWallets,
  });
}
