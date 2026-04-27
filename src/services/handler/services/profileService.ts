import Relay from 'src/services/relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';

export class ProfileService {
  static async updateProfile(
    appID: string,
    appName: string,
    walletImage: any,
    authToken: string,
  ) {
    try {
      const response = await Relay.updateApp(
        appID,
        appName,
        walletImage,
        authToken,
      );
      if (response.updated) {
        dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appID, {
          appName,
          walletImage: response.imageUrl,
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async removeWalletPicture(appID: string, authToken: string) {
    const response = await Relay.removeWalletPicture(authToken, appID);
    if (response.success) {
      dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appID, {
        walletImage: null,
      });
    }

    return response;
  }
}
