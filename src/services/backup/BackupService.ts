import { TribeApp } from 'src/models/interfaces/TribeApp';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import RGBServices from 'src/services/rgb/RGBServices'; // Native RGB Services
import Relay from 'src/services/relay';
import { Platform } from 'react-native';
import { Keys, Storage } from 'src/storage';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { generateEncryptionKey, encrypt, decrypt } from 'src/utils/encryption';
import RealmDatabase from 'src/storage/realm/realm';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { BackupAction } from 'src/models/enums/Backup';
import { WalletService } from 'src/services/wallet/WalletService'; 
// We might need WalletService for refreshing wallets after restore

export class BackupService {
  private static instance: BackupService;

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async isBackupRequired() {
    try {
      return await RGBServices.isBackupRequired();
    } catch (error) {
      throw error;
    }
  }

  async backup() {
    try {
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
      const wallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
      const isBackupRequired = await RGBServices.isBackupRequired();
      
      if (isBackupRequired) {
        const backupFile = await RGBServices.backup('', app.primaryMnemonic, app.publicId);
        if (backupFile.file) {
          const response = await Relay.rgbFileBackup(
            Platform.select({
              android: `file://${backupFile.file}`,
              ios: backupFile.file,
            }),
            app.id,
            wallet.masterFingerprint,
          );
          if (response.uploaded) {
            Storage.set(Keys.RGB_ASSET_RELAY_BACKUP, Date.now());
          }
        }
      }
    } catch (error) {
      console.log('backup error', error);
    }
  }

  async createBackup(confirmed: boolean) {
    try {
      dbManager.createObject(RealmSchema.BackupHistory, {
        title: confirmed
          ? BackupAction.SEED_BACKUP_CONFIRMED
          : BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED,
        date: new Date().toString(),
        confirmed,
        subtitle: '',
      });
      return true;
    } catch (error) {
      console.log('backup', error);
      throw error;
    }
  }

  async downloadFile({ ...obj }: RNFS.DownloadFileOptionsT) {
    const { promise } = RNFS.downloadFile({
      progressDivider: 100,
      progressInterval: 5000,
      ...obj,
    });
    return promise;
  }

  async backupAppImage({
    settings = false,
    room = null,
    all = false,
    tnxMeta = null,
  }: {
    settings?: boolean;
    room?: null | any;
    all?: boolean;
    tnxMeta?: null | { txid: string; metaData: object };
  }) {
    Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, false);
    try {
      const app = (dbManager.getCollection(RealmSchema.TribeApp) as any)[0];
      const encryptionKey = generateEncryptionKey(app.primaryMnemonic);
      let settingsObject: any = '';
      let roomsObject: any = {};
      let tnxMetaObject: any = {};

      if (all || settings) {
        const keys = [Keys.APP_CURRENCY, Keys.APP_LANGUAGE, Keys.CURRENCY_MODE];
        settingsObject = Object.fromEntries(
          keys
            .map(key => [key, Storage.get(key)])
            .filter(([, value]) => value !== undefined && value !== null),
        );
        settingsObject = encrypt(encryptionKey, JSON.stringify(settingsObject));
      }

      if (all) {
        const rooms = dbManager.getCollection(RealmSchema.HolepunchRoom);
        for (const index in rooms) {
          const room = rooms[index];
          const encryptedRoom = encrypt(encryptionKey, JSON.stringify(room));
          const encryptedRoomId = encrypt(encryptionKey, room.roomId);
          roomsObject[encryptedRoomId] = encryptedRoom;
        }

        const transactions = getJSONFromRealmObject(
          dbManager.getObjectByIndex(RealmSchema.Wallet),
        ).specs?.transactions;
        if (transactions) {
            for (const tnx of transactions) {
            if (Object.keys(tnx.metadata).length) {
                const encryptedMeta = encrypt(
                encryptionKey,
                JSON.stringify(tnx.metadata),
                );
                tnxMetaObject[tnx.txid] = encryptedMeta;
            }
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

      await Relay.createAppImageBackup(
        app.authToken,
        roomsObject,
        settingsObject,
        tnxMetaObject,
      );
      return {
        status: true,
        message: 'App image backup created successfully',
      };
    } catch (err) {
      Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, true);
      console.log('🚀 ~ BackupService ~ backupAppImage ~ err:', err);
      return {
        status: false,
        message: 'App image backup failed',
      };
    }
  }

  async restoreAppImage({
    mnemonic,
    settingsObject,
    roomsObject,
    tnxMetaObject,
  }: {
      mnemonic: string,
      settingsObject?: any,
      roomsObject?: any,
      tnxMetaObject?: any
  }) {
    const encryptionKey = generateEncryptionKey(mnemonic);
    try {
      if (settingsObject) {
        const decrypted = decrypt(encryptionKey, settingsObject);
        const decryptedData = JSON.parse(decrypted);
        Object.entries(decryptedData).forEach(([key, value]: [string, any]) => {
          Storage.set(key, value);
        });
      }
      let rooms: any[] = [];
      if (roomsObject) {
        Object.entries(roomsObject).forEach(
          ([key, value]: [string, any]) => {
            const decryptedData = JSON.parse(decrypt(encryptionKey, value));
            rooms.push(decryptedData);
          },
        );
        RealmDatabase.createBulk(RealmSchema.HolepunchRoom, rooms, 'modified');
      }
      if (tnxMetaObject) {
        let decryptedData: any = {};
        Object.entries(tnxMetaObject).forEach(([key, value]: [string, any]) => {
          const decryptedValue = JSON.parse(decrypt(encryptionKey, value));
          decryptedData[key] = decryptedValue;
        });
        
        // Refresh Wallets to apply metadata
        // Delegating to WalletService
        const wallets = dbManager.getCollection(RealmSchema.Wallet);
        // @ts-ignore
        await WalletService.getInstance().refreshWallets(wallets, decryptedData);
      }
    } catch (error) {
      console.log('🚀 AppRestoreFailed: ', error);
    }
    // disabled first app image backup, since already restored from backup
    if (settingsObject || roomsObject || tnxMetaObject)
      Storage.set(Keys.FIRST_APP_IMAGE_BACKUP_COMPLETE, true);
  }
}
