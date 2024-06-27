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
import {
  encrypt,
  generateEncryptionKey,
  hash512,
  stringToArrayBuffer,
} from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import dbManager from 'src/storage/realm/dbManager';
import PinMethod from 'src/models/enums/PinMethod';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import BIP85 from '../wallets/operations/BIP85';
import { RealmSchema } from 'src/storage/enum';

export class ApiHandler {
  static performSomeAsyncOperation() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Success');
      }, 1000);
    });
  }

  static async createNewWallet({
    instanceNum = 0,
    walletName = 'Default Wallet',
    walletDescription = 'Default BIP85 Tribe Wallet',
    transferPolicy = 5000,
  }) {
    const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
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
      primaryMnemonic: app.primaryMnemonic,
      networkType: config.NETWORK_TYPE,
      transferPolicy: {
        id: uuidv4(),
        threshold: transferPolicy,
      },
    });
    return wallet;
  }

  static async setupNewApp(
    appName: string,
    pinMethod = PinMethod.DEFAULT,
    passcode = '',
  ) {
    const AES_KEY = generateEncryptionKey();
    const hash = hash512(
      pinMethod !== PinMethod.DEFAULT
        ? passcode
        : config.ENC_KEY_STORAGE_IDENTIFIER,
    );
    const encryptedKey = encrypt(hash, AES_KEY);
    SecureStore.store(hash, encryptedKey);
    const uint8array = stringToArrayBuffer(AES_KEY);
    const isRealmInit = await dbManager.initializeRealm(uint8array);
    if (isRealmInit) {
      const primaryMnemonic = bip39.generateMnemonic();
      const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
      const appID = crypto
        .createHash('sha256')
        .update(primarySeed)
        .digest('hex');
      const publicId = WalletUtilities.getFingerprintFromSeed(primarySeed);
      const entropy = BIP85.bip39MnemonicToEntropy(
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic,
      );
      const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
      const newAPP: TribeApp = {
        id: appID,
        publicId,
        appName,
        primaryMnemonic,
        primarySeed: primarySeed.toString('hex'),
        imageEncryptionKey,
        version: '',
        networkType: config.NETWORK_TYPE,
        enableAnalytics: true,
      };
      const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
      if (created) {
        const wallet = await ApiHandler.createNewWallet({});
        dbManager.createObject(RealmSchema.Wallet, wallet);
      }
    } else {
      throw new Error('Realm initialisation failed');
    }
  }
}
