import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  WalletType,
} from 'src/services/wallets/enums';
import config from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';
import WalletUtilities from 'src/services/wallets/operations/utils';
import {
  DerivationConfig,
  Wallet,
} from 'src/services/wallets/interfaces/wallet';
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
import WalletOperations from '../wallets/operations';
import { Vault } from '../wallets/interfaces/vault';
import ElectrumClient, { ELECTRUM_CLIENT } from '../electrum/client';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from '../electrum/predefinedNodes';
import { NodeDetail } from '../wallets/interfaces';

export class ApiHandler {
  static performSomeAsyncOperation() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Success');
      }, 1000);
    });
  }

  static async setupNewApp(
    appName: string,
    pinMethod = PinMethod.DEFAULT,
    passcode = '',
    walletImage: string,
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
        walletImage,
        primaryMnemonic,
        primarySeed: primarySeed.toString('hex'),
        imageEncryptionKey,
        version: '',
        networkType: config.NETWORK_TYPE,
        enableAnalytics: true,
      };
      const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
      if (created) {
        await ApiHandler.createNewWallet({});
      }
    } else {
      throw new Error('Realm initialisation failed');
    }
  }

  static async createNewWallet({
    instanceNum = 0,
    walletName = 'Default Wallet',
    walletDescription = 'Default BIP85 Tribe Wallet',
    transferPolicy = 5000,
  }) {
    try {
      const { primaryMnemonic } = dbManager.getObjectByIndex(
        RealmSchema.TribeApp,
      ) as any;
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
      const wallet: Wallet = await generateWallet({
        type: WalletType.DEFAULT,
        instanceNum: instanceNum,
        walletName: walletName || 'Default Wallet',
        walletDescription: walletDescription || '',
        derivationConfig,
        primaryMnemonic: primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy: {
          id: uuidv4(),
          threshold: transferPolicy,
        },
      });
      if (wallet) {
        dbManager.createObject(RealmSchema.Wallet, wallet);
        return wallet;
      } else {
        throw new Error('Failed to create wallet');
      }
    } catch (err) {
      console.log({ err });
    }
  }

  static async connectToNode() {
    const defaultNodes =
      config.NETWORK_TYPE === NetworkType.TESTNET
        ? predefinedTestnetNodes
        : predefinedMainnetNodes;
    const privateNodes: NodeDetail[] = dbManager.getCollection(
      RealmSchema.NodeConnect,
    ) as any;
    ElectrumClient.setActivePeer(defaultNodes, privateNodes);
    const { connected, connectedTo, error } = await ElectrumClient.connect();
    return { connected, connectedTo, error };
  }

  static async refreshWallets({ wallets }: { wallets: Wallet[] }) {
    try {
      if (!ELECTRUM_CLIENT.isClientConnected) {
        ElectrumClient.resetCurrentPeerIndex();
        const { connected, connectedTo, error } =
          await ApiHandler.connectToNode();
        if (connected) {
          console.log('Connected to: ', connectedTo);
        }
        if (error) {
          console.log('Node connection err: ', error);
          return;
        }
      }

      const network = WalletUtilities.getNetworkByType(wallets[0].networkType);
      const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } =
        await WalletOperations.syncWalletsViaElectrumClient(wallets, network);

      for (const synchedWallet of synchedWallets) {
        // if (!synchedWallet.specs.hasNewUpdates) continue; // no new updates found

        dbManager.updateObjectById(RealmSchema.Wallet, synchedWallet.id, {
          specs: synchedWallet.specs,
        });
      }

      return {
        synchedWallets,
      };
    } catch (err) {
      console.log({ err });
    }
  }
}
