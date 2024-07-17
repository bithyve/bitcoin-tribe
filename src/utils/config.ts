import config from 'react-native-config';
import * as bitcoinJS from 'bitcoinjs-lib';
import { NetworkType, WalletType } from 'src/services/wallets/enums';

export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

export enum BITCOIN_NETWORK {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

class Configuration {
  public ENVIRONMENT: string;
  public NETWORK_TYPE: NetworkType;
  public NETWORK: bitcoinJS.Network;
  public ENC_KEY_STORAGE_IDENTIFIER = 'TRIBE-KEY';
  public BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH =
    "m/83696968'/39'/0'/12'/83696968'";
  public WALLET_INSTANCE_SERIES = {
    [WalletType.DEFAULT]: {
      series: 0,
      upperBound: 100,
    },
  };
  public GAP_LIMIT: number = 5;
  public HEXA_ID: string =
    'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a';
  public RELAY: string = 'https://bithyve-dev-relay.el.r.appspot.com/';

  constructor() {
    this.ENVIRONMENT = config.ENVIRONMENT?.trim();
    this.NETWORK_TYPE =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION
        ? NetworkType.MAINNET
        : NetworkType.TESTNET;
    this.NETWORK =
      this.NETWORK_TYPE === NetworkType.MAINNET
        ? bitcoinJS.networks.bitcoin
        : bitcoinJS.networks.testnet;
  }
}

export default new Configuration();
