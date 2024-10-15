import { MMKV } from 'react-native-mmkv';

const MMKVStorage = new MMKV();

export enum Keys {
  APPID = 'APPID',
  PIN_METHOD = 'PIN_METHOD',
  AVERAGE_TX_FEE_BY_NETWORK = 'AVERAGE_TX_FEE_BY_NETWORK',
  THEME_MODE = 'THEME_MODE',
  WALLET_BACKUP = 'WALLET_BACKUP',
  APP_LANGUAGE = 'APP_LANGUAGE',
  EXCHANGE_RATES = 'EXCHANGE_RATES',
  APP_CURRENCY = 'APP_CURRENCY',
  CURRENCY_MODE = 'CURRENCY_MODE',
  BACKUPALERT = 'BACKUPALERT',
}

export class Storage {
  static set = (key: Keys, value: string | number | boolean): void =>
    MMKVStorage.set(key, value);

  static get = (key: Keys): string | undefined => MMKVStorage.getString(key);
}
