import { MMKV } from 'react-native-mmkv';

const MMKVStorage = new MMKV();

export enum Keys {
  APPID = 'APPID',
  PIN_METHOD = 'PIN_METHOD',
  AVERAGE_TX_FEE_BY_NETWORK = 'AVERAGE_TX_FEE_BY_NETWORK',
  THEME_MODE = 'THEME_MODE',
  IS_USER_SELECT_THEME = 'IS_USER_SELECT_THEME',
  WALLET_BACKUP = 'WALLET_BACKUP',
  ASSET_BACKUP = 'ASSET_BACKUP',
  APP_LANGUAGE = 'APP_LANGUAGE',
  EXCHANGE_RATES = 'EXCHANGE_RATES',
  APP_CURRENCY = 'APP_CURRENCY',
  CURRENCY_MODE = 'CURRENCY_MODE',
  BACKUPALERT = 'BACKUPALERT',
  SETUPAPP = 'SETUPAPP',
  RGB_ASSET_RELAY_BACKUP = 'RGB_ASSET_RELAY_BACKUP',
  FCM_TOKEN = 'FCM_TOKEN',
  SHOW_WALLET_BACKUP_ALERT = 'SHOW_WALLET_BACKUP_ALERT',
  SERVICE_FEE = 'SERVICE_FEE',
  LAST_FCM_VERSION_TOPIC = 'LAST_FCM_VERSION_TOPIC',
  DISCLAIMER_VISIBILITY = 'DISCLAIMER_VISIBILITY',
  INVOICE_EXPIRY = 'INVOICE_EXPIRY',
  VERIFY_TWITTER_INFO = 'VERIFY_TWITTER_INFO',
  VERIFY_DOMAIN_INFO = 'VERIFY_DOMAIN_INFO',
  RATE_LIMIT_KEY = 'TWITTER_RATE_LIMIT_TIME',
  RATE_LIMITED_TWEET_URL_KEY = 'RATE_LIMITED_TWEET_URL',
  PARTICIPATED_CAMPAIGNS = 'PARTICIPATED_CAMPAIGNS',
  PRESET_ASSETS = 'PRESET_ASSETS',
  FIRST_APP_IMAGE_BACKUP_COMPLETE = 'FIRST_APP_IMAGE_BACKUP_COMPLETE',
  IS_APP_IMAGE_BACKUP_ERROR = 'IS_APP_IMAGE_BACKUP_ERROR'
}

export class Storage {
  static set = (key: Keys, value: string | number | boolean): void => {
    if (!this.isInitialized()) {
      throw new Error('Storage is not initialized');
    }

    if (typeof value === 'string') {
      MMKVStorage.set(key, value);
    } else if (typeof value === 'number') {
      MMKVStorage.set(key, value);
    } else if (typeof value === 'boolean') {
      MMKVStorage.set(key, value);
    } else {
      console.warn('Unsupported value type:', value, key);
    }
  };

  static get = (key: Keys): string | number | boolean | undefined => {
    if (!this.isInitialized()) {
      console.warn('Storage is not initialized');
      return undefined;
    }

    const stringValue = MMKVStorage.getString(key);
    if (stringValue !== undefined) {
      return stringValue;
    }

    const numberValue = MMKVStorage.getNumber(key);
    if (numberValue !== undefined) {
      return numberValue;
    }

    const booleanValue = MMKVStorage.getBoolean(key);
    if (booleanValue !== undefined) {
      return booleanValue;
    }

    return undefined;
  };

  static clear = (): void => {
    if (!this.isInitialized()) {
      console.warn('Storage is not initialized');
      return;
    }
    MMKVStorage.clearAll();
  };

  static readAll() {
    const keys = MMKVStorage.getAllKeys();
    const allData = {};
  
    keys.forEach((key) => {
      allData[key] = MMKVStorage.getString(key) || MMKVStorage.getNumber(key) || MMKVStorage.getBoolean(key);
    });
  
    return allData;
  }

  static isInitialized(): boolean {
    try {
      MMKVStorage.set('__init_test__', 'ok');
      const test = MMKVStorage.getString('__init_test__');
      MMKVStorage.delete('__init_test__');
      return test === 'ok';
    } catch (e) {
      console.error('Storage initialization check failed:', e);
      return false;
    }
  }
}
