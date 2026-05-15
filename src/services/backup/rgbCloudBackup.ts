import { Platform } from 'react-native';
import { Keys, Storage } from 'src/storage';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import Relay from 'src/services/relay';
import RGBServices from 'src/services/rgb/RGBServices';
import { backupFinished, backupStarted, backupSucceeded } from './backupUiBridge';

export async function backupRgbOnCloudWithBanners(): Promise<{ backedUp: boolean }> {
  backupStarted();
  try {
    const app: TribeApp = dbManager.getObjectByIndex<TribeApp>(
      RealmSchema.TribeApp,
    ) as TribeApp;
    const wallet: RGBWallet = dbManager.getObjectByIndex<RGBWallet>(
      RealmSchema.RgbWallet,
    ) as RGBWallet;

    const backupFile = await RGBServices.backup('', app.primaryMnemonic, app.publicId);
    if (!backupFile?.file) {
      return { backedUp: false };
    }

    const response = await Relay.rgbFileBackup(
      Platform.select({
        android: `file://${backupFile.file}`,
        ios: backupFile.file,
      }),
      app.id,
      wallet.masterFingerprint,
    );

    if (response?.uploaded) {
      Storage.set(Keys.RGB_ASSET_RELAY_BACKUP, Date.now());
      backupSucceeded();
      return { backedUp: true };
    }

    return { backedUp: false };
  } catch (error) {
    // Preserve existing behavior: don't throw, just log at call site if desired.
    return { backedUp: false };
  } finally {
    backupFinished();
  }
}

