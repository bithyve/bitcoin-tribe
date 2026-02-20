import {
  decrypt,
  encrypt,
  hash512,
  stringToArrayBuffer,
} from 'src/utils/encryption';
import config, { APP_STAGE } from 'src/utils/config';
import * as SecureStore from 'src/storage/secure-store';
import dbManager from 'src/storage/realm/dbManager';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { NodeService } from 'src/services/node/NodeService';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(): Promise<{ key: string; isWalletOnline: boolean }> {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const uint8array = stringToArrayBuffer(key);
    await dbManager.initializeRealm(uint8array);
    
    // Legacy support: Initialize ApiHandler state
    const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
    const rgbWallet = (await dbManager.getObjectByIndex(RealmSchema.RgbWallet)) as RGBWallet;
    
    // Initialize NodeService API
    if (app.appType === AppType.NODE_CONNECT || app.appType === AppType.SUPPORTED_RLN) {
        NodeService.getInstance().initApi(rgbWallet.nodeUrl, rgbWallet.nodeAuthentication, app.authToken);
    }

    if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
      config.NETWORK_TYPE = app.networkType;
    }

    return { key, isWalletOnline: false };
  }

  async loginWithPin(pin: string): Promise<{ key: string; isWalletOnline: boolean }> {
    try {
      const hash = hash512(pin);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      const uint8array = stringToArrayBuffer(key);
      await dbManager.initializeRealm(uint8array);
      
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
      const rgbWallet = (await dbManager.getObjectByIndex(RealmSchema.RgbWallet)) as RGBWallet;
      
      if (app.appType === AppType.NODE_CONNECT || app.appType === AppType.SUPPORTED_RLN) {
          NodeService.getInstance().initApi(rgbWallet.nodeUrl, rgbWallet.nodeAuthentication, app.authToken);
      }
      
      if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
        config.NETWORK_TYPE = app.networkType;
      }
      return { key, isWalletOnline: false };
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  }

  async biometricLogin(signature: string): Promise<{ key: string; isWalletOnline: boolean }> {
    const appId = (await Storage.get(Keys.APPID)) as string;
    const res = await SecureStore.verifyBiometricAuth(signature, appId);
    if (!res.success) {
      throw new Error('Biometric Auth Failed');
    }
    const hash = res.hash;
    const encryptedKey = res.encryptedKey;
    const key = decrypt(hash, encryptedKey);
    const uint8array = stringToArrayBuffer(key);
    await dbManager.initializeRealm(uint8array);

    const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
    const rgbWallet = (await dbManager.getObjectByIndex(RealmSchema.RgbWallet)) as RGBWallet;
    
    if (app.appType === AppType.NODE_CONNECT || app.appType === AppType.SUPPORTED_RLN) {
        NodeService.getInstance().initApi(rgbWallet.nodeUrl, rgbWallet.nodeAuthentication, app.authToken);
    }

    if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
      config.NETWORK_TYPE = app.networkType;
    }
    return { key, isWalletOnline: false };
  }

  async createPin(pin: string): Promise<void> {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const newHash = hash512(pin);
    const encryptedKey = encrypt(newHash, key);
    SecureStore.store(newHash, encryptedKey);
    Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
  }

  async verifyPin(pin: string): Promise<string> {
    try {
      const hash = hash512(pin);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      if (!key) {
        throw new Error('PIN not found');
      }
      return key;
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  }

  async changePin(key: string, pin: string = ''): Promise<void> {
    const hash = hash512(pin || config.ENC_KEY_STORAGE_IDENTIFIER);
    const encryptedKey = encrypt(hash, key);
    SecureStore.store(hash, encryptedKey);
    if (!pin) {
      Storage.set(Keys.PIN_METHOD, PinMethod.DEFAULT);
    }
  }
}
