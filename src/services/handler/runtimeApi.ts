import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { RLNNodeApiServices } from '../rgbnode/RLNNodeApi';

export class ApiHandler {
  private static initialized = false;

  constructor(app: RGBWallet, appType: AppType, _authToken: string) {
    if (!ApiHandler.initialized) {
      ApiHandler.initialized = true;
      if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
        new RLNNodeApiServices({
          baseUrl: app.nodeUrl,
          apiKey: app.nodeAuthentication,
        });
      }
    }
  }
}