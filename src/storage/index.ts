import { MMKV } from 'react-native-mmkv';

const MMKVStorage = new MMKV();

export enum Keys {
  APPID = 'APPID',
  PIN_METHOD = 'PIN_METHOD',
  AVERAGE_TX_FEE_BY_NETWORK = 'AVERAGE_TX_FEE_BY_NETWORK',
}

export class Storage {
  static set = (key: Keys, value: string | number | boolean): void =>
    MMKVStorage.set(key, value);

  static get = (key: Keys): string | undefined => MMKVStorage.getString(key);
}
