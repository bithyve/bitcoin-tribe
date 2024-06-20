import config from 'react-native-config';

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

  constructor() {
    this.ENVIRONMENT = config.ENVIRONMENT?.trim();
  }
}

export default new Configuration();
