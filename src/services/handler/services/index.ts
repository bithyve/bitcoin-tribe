import * as network from './networkServices';
import * as authOnboarding from './AppAndLoginServices';
import * as wallet from './WalletServices';
import * as asset from './RgbWalletServices';
import * as node from './RLNServices';
import * as profile from './profileServices';
import * as backup from './backupService';

export const ApiHandler = {
  ...network,
  ...authOnboarding,
  ...wallet,
  ...asset,
  ...node,
  ...profile,
  ...backup,
};

export * from './networkServices';
export * from './AppAndLoginServices';
export * from './WalletServices';
export * from './RgbWalletServices';
export * from './RLNServices';
export * from './profileServices';
export * from './backupService';
