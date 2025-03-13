import { NetworkType } from 'src/services/wallets/enums';
import AppType from '../enums/AppType';

export interface TribeApp {
  id: string;
  publicId: string;
  appName?: string;
  walletImage?: string;
  primaryMnemonic?: string;
  primarySeed?: string;
  imageEncryptionKey: string;
  version: string;
  networkType: NetworkType;
  enableAnalytics: boolean;
  appType: AppType;
  authToken?: string;
}
