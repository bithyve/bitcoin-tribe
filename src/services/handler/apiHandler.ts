import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import {
  DerivationPurpose,
  EntityKind,
  WalletType,
} from 'src/services/wallets/enums';
import config from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { DerivationConfig } from 'src/services/wallets/interfaces/wallet';

export class ApiHandler {
  static performSomeAsyncOperation() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Success');
      }, 1000);
    });
  }

  static async createNewWallet({
    instanceNum,
    walletName,
    walletDescription,
    transferPolicy = 5000,
  }) {
    const primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';
    const purpose = DerivationPurpose.BIP84;
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      purpose,
    );
    const derivationConfig: DerivationConfig = {
      path,
      purpose,
    };
    const wallet = generateWallet({
      type: WalletType.DEFAULT,
      instanceNum: instanceNum,
      walletName: walletName || 'Default Wallet',
      walletDescription: walletDescription || '',
      derivationConfig,
      primaryMnemonic,
      networkType: config.NETWORK_TYPE,
      transferPolicy: {
        id: uuidv4(),
        threshold: transferPolicy,
      },
    });
    return wallet;
  }
}
