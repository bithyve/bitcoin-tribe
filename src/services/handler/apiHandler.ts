import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  TxPriority,
  WalletType,
} from 'src/services/wallets/enums';
import config from 'src/utils/config';
import DeviceInfo from 'react-native-device-info';
import WalletUtilities from 'src/services/wallets/operations/utils';
import {
  DerivationConfig,
  Wallet,
} from 'src/services/wallets/interfaces/wallet';
import {
  decrypt,
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
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  NodeDetail,
  TransactionPrerequisite,
} from '../wallets/interfaces';
import { Keys, Storage } from 'src/storage';
import Relay from '../relay';
import RGBServices from '../rgb/RGBServices';
import {
  Collectible,
  RgbNodeConnectParams,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { NativeModules, Platform } from 'react-native';
import { BackupAction, CloudBackupAction } from 'src/models/enums/Backup';
import {
  Configuration,
  NodeInfoResponse,
  OnChainApi,
  OtherApi,
} from '../rgbnode';
import AppType from 'src/models/enums/AppType';

var RNFS = require('react-native-fs');

export class ApiHandler {
  private static app: RGBWallet;
  private static appType: AppType;
  private static config;
  constructor(app: RGBWallet, appType: AppType) {
    if (!ApiHandler.app) {
      ApiHandler.app = app;
      ApiHandler.appType = appType;
      if (appType === AppType.NODE_CONNECT) {
        ApiHandler.config = new Configuration({
          basePath: app.nodeUrl,
          accessToken: app.nodeAuthentication,
        });
      }
    }
  }

  static performSomeAsyncOperation() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Success');
      }, 1000);
    });
  }

  static async setupNewApp({
    appName = '',
    pinMethod = PinMethod.DEFAULT,
    passcode = '',
    walletImage = '',
    mnemonic = null,
    appType,
    rgbNodeConnectParams,
    rgbNodeInfo,
  }: {
    appName: string;
    pinMethod: PinMethod;
    passcode: '';
    walletImage: '';
    mnemonic: string;
    appType: AppType;
    rgbNodeConnectParams?: RgbNodeConnectParams;
    rgbNodeInfo?: NodeInfoResponse;
  }) {
    Storage.set(Keys.PIN_METHOD, pinMethod);
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
      if (appType === AppType.ON_CHAIN) {
        const primaryMnemonic = mnemonic ? mnemonic : bip39.generateMnemonic();
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
        const imageEncryptionKey = generateEncryptionKey(
          entropy.toString('hex'),
        );
        const newAPP: TribeApp = {
          id: appID,
          publicId,
          appName,
          walletImage,
          primaryMnemonic,
          primarySeed: primarySeed.toString('hex'),
          imageEncryptionKey,
          version: DeviceInfo.getVersion(),
          networkType: config.NETWORK_TYPE,
          enableAnalytics: true,
          appType,
        };
        const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
        if (created) {
          await ApiHandler.createNewWallet({});
          const rgbWallet: RGBWallet = await RGBServices.restoreKeys(
            primaryMnemonic,
          );
          dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
          const isWalletOnline = await RGBServices.initiate(
            rgbWallet.mnemonic,
            rgbWallet.accountXpub,
          );
          Storage.set(Keys.APPID, appID);
          dbManager.createObject(RealmSchema.VersionHistory, {
            version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            releaseNote: '',
            date: new Date().toString(),
            title: 'Initially installed',
          });
        }
      } else {
        const newAPP: TribeApp = {
          id: rgbNodeConnectParams.nodeId,
          publicId: rgbNodeInfo.pubkey,
          appName,
          walletImage,
          primaryMnemonic: rgbNodeConnectParams.nodeId,
          primarySeed: rgbNodeConnectParams.nodeId,
          imageEncryptionKey: '',
          version: DeviceInfo.getVersion(),
          networkType: config.NETWORK_TYPE,
          enableAnalytics: true,
          appType,
          nodeInfo: rgbNodeInfo,
          nodeUrl: rgbNodeConnectParams.nodeUrl,
          nodeAuthentication: rgbNodeConnectParams.authentication,
        };
        const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
        if (created) {
          const rgbWallet: RGBWallet = {
            mnemonic: rgbNodeInfo.pubkey,
            xpub: rgbNodeInfo.pubkey,
            rgbDir: '',
            accountXpub: rgbNodeInfo.pubkey,
            accountXpubFingerprint: rgbNodeInfo.pubkey,
            nodeUrl: rgbNodeConnectParams.nodeUrl,
            nodeAuthentication: rgbNodeConnectParams.authentication,
          };
          const apiHandler = new ApiHandler(rgbWallet, appType);
          dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
          Storage.set(Keys.APPID, rgbNodeConnectParams.nodeId);
          dbManager.createObject(RealmSchema.VersionHistory, {
            version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            releaseNote: '',
            date: new Date().toString(),
            title: 'Initially installed',
          });
        }
      }
    } else {
      throw new Error('Realm initialisation failed');
    }
  }

  static async biometricLogin(signature: string) {
    const appId = await Storage.get(Keys.APPID);
    const res = await SecureStore.verifyBiometricAuth(signature, appId);
    if (!res.success) {
      throw new Error('Biometric Auth Failed');
    }
    const hash = res.hash;
    const encryptedKey = res.encryptedKey;
    const key = decrypt(hash, encryptedKey);
    const uint8array = stringToArrayBuffer(key);
    await dbManager.initializeRealm(uint8array);
    const rgbWallet: RGBWallet = await dbManager.getObjectByIndex(
      RealmSchema.RgbWallet,
    );
    const isWalletOnline = await RGBServices.initiate(
      rgbWallet.mnemonic,
      rgbWallet.accountXpub,
    );
    return { key, isWalletOnline };
  }

  static async createPin(pin: string) {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const newHash = hash512(pin);
    const encryptedKey = encrypt(newHash, key);
    SecureStore.store(newHash, encryptedKey);
    await SecureStore.remove(hash);
    Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
  }

  static async resetPinMethod(key: string) {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const encryptedKey = encrypt(hash, key);
    SecureStore.store(hash, encryptedKey);
    Storage.set(Keys.PIN_METHOD, PinMethod.DEFAULT);
  }

  static async loginWithPin(pin: string) {
    try {
      const hash = hash512(pin);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      const uint8array = stringToArrayBuffer(key);
      await dbManager.initializeRealm(uint8array);
      const rgbWallet: RGBWallet = await dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      const isWalletOnline = await RGBServices.initiate(
        rgbWallet.mnemonic,
        rgbWallet.accountXpub,
      );
      return { key, isWalletOnline };
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  }
  static async verifyPin(pin: string) {
    try {
      const hash = hash512(pin);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      return key;
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  }

  static async login() {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const uint8array = stringToArrayBuffer(key);
    await dbManager.initializeRealm(uint8array);
    const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
    const rgbWallet: RGBWallet = await dbManager.getObjectByIndex(
      RealmSchema.RgbWallet,
    );
    const apiHandler = new ApiHandler(rgbWallet, app.appType);
    if (app.appType === AppType.NODE_CONNECT) {
      return { key, isWalletOnline: true };
    } else {
      const isWalletOnline = await RGBServices.initiate(
        rgbWallet.mnemonic,
        rgbWallet.accountXpub,
      );
      return { key, isWalletOnline };
    }
  }

  static async createNewWallet({
    instanceNum = 0,
    walletName = 'Default Wallet',
    walletDescription = 'Default Tribe Wallet',
  }) {
    try {
      const { primaryMnemonic } = dbManager.getObjectByIndex(
        RealmSchema.TribeApp,
      ) as any;
      const purpose = DerivationPurpose.BIP86; // Default: TAPROOT
      const accountNumber = 0;
      const path = WalletUtilities.getDerivationPath(
        EntityKind.WALLET,
        config.NETWORK_TYPE,
        accountNumber,
        purpose,
      );
      const derivationConfig: DerivationConfig = {
        path,
        purpose,
      };
      const wallet: Wallet = await generateWallet({
        type: WalletType.DEFAULT,
        instanceNum,
        walletName,
        walletDescription,
        derivationConfig,
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
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
    if (connected) {
      WalletOperations.calculateAverageTxFee().then(averageTxFeeByNetwork => {
        Storage.set(
          Keys.AVERAGE_TX_FEE_BY_NETWORK,
          JSON.stringify(averageTxFeeByNetwork),
        );
      });
    }

    return { connected, connectedTo, error };
  }

  static async getTxRates() {
    WalletOperations.calculateAverageTxFee().then(averageTxFeeByNetwork => {
      Storage.set(
        Keys.AVERAGE_TX_FEE_BY_NETWORK,
        JSON.stringify(averageTxFeeByNetwork),
      );
    });
  }

  static async refreshWallets({ wallets }: { wallets: Wallet[] }) {
    try {
      if (ApiHandler.appType === AppType.NODE_CONNECT) {
        const balances = await RGBServices.getBtcBalance(ApiHandler.config);
        if (balances.vanilla) {
          const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
            RealmSchema.RgbWallet,
          );
          dbManager.updateObjectByPrimaryId(
            RealmSchema.RgbWallet,
            'mnemonic',
            rgbWallet.mnemonic,
            {
              nodeBtcBalance: balances,
            },
          );
          return balances;
        }
      } else {
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

        const network = WalletUtilities.getNetworkByType(
          wallets[0].networkType,
        );
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
      }
    } catch (err) {
      console.log({ err });
    }
  }

  static async sendPhaseOne({
    sender,
    recipient,
    averageTxFee,
    selectedPriority,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    averageTxFee: AverageTxFees;
    selectedPriority: TxPriority;
  }): Promise<TransactionPrerequisite> {
    const recipients = [recipient];
    const { txPrerequisites } = await WalletOperations.transferST1(
      sender,
      recipients,
      averageTxFee,
      selectedPriority,
    );

    return txPrerequisites;
  }

  static async sendPhaseTwo({
    sender,
    recipient,
    txPrerequisites,
    txPriority,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    txPrerequisites: TransactionPrerequisite;
    txPriority: TxPriority;
  }): Promise<{ txid: string }> {
    const { txid } = await WalletOperations.transferST2(
      sender,
      txPrerequisites,
      txPriority,
      [recipient],
    );
    if (txid) {
      dbManager.updateObjectById(RealmSchema.Wallet, sender.id, {
        specs: sender.specs,
      });
      return { txid };
    } else {
      throw new Error('Failed to execute the transaction');
    }
  }

  static async sendTransaction({
    sender,
    recipient,
    averageTxFee,
    selectedPriority,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    averageTxFee: AverageTxFees;
    selectedPriority: TxPriority;
  }): Promise<{ txid: string; txPrerequisites: TransactionPrerequisite }> {
    const txPrerequisites = await ApiHandler.sendPhaseOne({
      sender,
      recipient,
      averageTxFee,
      selectedPriority,
    });

    if (!txPrerequisites) {
      throw new Error('Failed to generate txPrerequisites');
    }
    const { txid } = await ApiHandler.sendPhaseTwo({
      sender,
      recipient,
      txPrerequisites,
      txPriority: selectedPriority,
    });

    return {
      txid,
      txPrerequisites,
    };
  }

  static async receiveTestSats() {
    try {
      if (ApiHandler.appType === AppType.NODE_CONNECT) {
        const response = await ApiHandler.getNodeOnchainBtcAddress();
        if (response.address) {
          const { funded } = await Relay.getTestcoins(
            response.address,
            NetworkType.TESTNET,
          );
          if (!funded) {
            throw new Error('Failed to get test coins');
          }
          ApiHandler.refreshWallets({ wallets: [] });
        } else {
          throw new Error('Failed to get test coins');
        }
      } else {
        const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet);
        const { changeAddress: receivingAddress } =
          WalletOperations.getNextFreeChangeAddress(wallet);
        const { funded } = await Relay.getTestcoins(
          receivingAddress,
          wallet.networkType,
        );
        if (!funded) {
          throw new Error('Failed to get test coins');
        }
        ApiHandler.refreshWallets({ wallets: [wallet.toJSON()] });
      }
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to get test coins');
    }
  }

  static async createUtxos() {
    try {
      if (ApiHandler.appType === AppType.NODE_CONNECT) {
        const utxos = await RGBServices.createUtxos(
          5,
          ApiHandler.appType,
          ApiHandler.config,
        );
        return utxos.created;
      } else {
        const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet);
        const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
        const averageTxFeeByNetwork: AverageTxFeesByNetwork =
          JSON.parse(averageTxFeeJSON);
        const averageTxFee = averageTxFeeByNetwork[wallet.networkType];
        const utxos = await RGBServices.createUtxos(
          averageTxFee.high.feePerByte,
          ApiHandler.appType,
          ApiHandler.config,
        );
        if (utxos.created) {
          return utxos.created;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.log({ error });
      throw new Error('Insufficient sats for RGB');
    }
  }

  static async receiveAsset() {
    try {
      const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      let response = await RGBServices.receiveAsset(
        ApiHandler.appType,
        ApiHandler.config,
      );
      if (response.error) {
        throw new Error(response.error);
      } else {
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            receiveData: response,
          },
        );
      }
    } catch (error) {
      console.log('errors', error);
      throw new Error(error);
    }
  }

  static async refreshRgbWallet() {
    try {
      const assets = await RGBServices.syncRgbAssets(
        ApiHandler.appType,
        ApiHandler.config,
      );
      if (assets.nia) {
        dbManager.createObjectBulk(RealmSchema.Coin, assets.nia);
      }
      if (assets.cfa) {
        dbManager.createObjectBulk(RealmSchema.Collectible, assets.cfa);
        if (Platform.OS === 'ios') {
          for (let i = 0; i < assets.cfa.length; i++) {
            const element: Collectible = assets.cfa[i];
            const ext = element.media.mime.split('/')[1];
            const destination = `${element.media.filePath}.${ext}`;
            const exists = await RNFS.exists(destination);
            if (!exists) {
              await RNFS.copyFile(
                element.media.filePath,
                `${element.media.filePath}.${ext}`,
              );
            }
          }
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  static async issueNewCoin({
    name,
    ticker,
    supply,
  }: {
    name: string;
    ticker: string;
    supply: string;
  }) {
    try {
      const response = await RGBServices.issueRgb20Asset(
        ticker,
        name,
        `${supply}`,
        ApiHandler.appType,
        ApiHandler.config,
      );
      if (response?.assetId) {
        await ApiHandler.refreshRgbWallet();
      }
      return response;
    } catch (error) {
      console.log('issueNewCoin', error);
      throw new Error(`${error}`);
    }
  }

  static async issueNewCollectible({
    name,
    description,
    supply,
    filePath,
  }: {
    name: string;
    description: string;
    supply: string;
    filePath: string;
  }) {
    try {
      const response = await RGBServices.issueRgb25Asset(
        name,
        description,
        `${supply}`,
        filePath,
      );
      if (response?.assetId) {
        await ApiHandler.refreshRgbWallet();
      }
      return response;
    } catch (error) {
      console.log('refreshRgbWallet', error);
      throw new Error(error);
    }
  }

  static async getAssetTransactions({
    assetId,
    schema,
  }: {
    assetId: string;
    schema: RealmSchema;
  }) {
    try {
      const response = await RGBServices.getRgbAssetTransactions(
        assetId,
        ApiHandler.appType,
        ApiHandler.config,
      );
      if (response.length > 0) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          transactions: response,
        });
      }
      return response;
    } catch (error) {
      console.log('refreshRgbWallet', error);
      throw new Error(error);
    }
  }

  static async sendAsset({
    assetId,
    blindedUTXO,
    amount,
    consignmentEndpoints,
    feeRate,
  }: {
    assetId: string;
    blindedUTXO: string;
    amount: string;
    consignmentEndpoints: string;
    feeRate: number;
  }) {
    try {
      const response = await RGBServices.sendAsset(
        assetId,
        blindedUTXO,
        amount,
        consignmentEndpoints,
        feeRate,
      );
      return response;
    } catch (error) {
      console.log('sendAsset', error);
      throw new Error(error);
    }
  }

  static async getAssetMetaData({
    assetId,
    schema,
  }: {
    assetId: string;
    schema: RealmSchema;
  }) {
    try {
      const response = await RGBServices.getRgbAssetMetaData(
        assetId,
        ApiHandler.appType,
        ApiHandler.config,
      );
      if (response) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          metaData: response,
        });
      }
      console.log(response);
      return response;
    } catch (error) {
      console.log('refreshRgbWallet', error);
      throw new Error(error);
    }
  }

  static async updateProfile(appID, appName, walletImage) {
    try {
      dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appID, {
        appName: appName,
        walletImage: walletImage,
      });
      return true;
    } catch (error) {
      console.log('Update Profile', error);
      throw new Error(error);
    }
  }

  static async checkVersion(previousVersion, currentVerion) {
    try {
      dbManager.createObject(RealmSchema.VersionHistory, {
        version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
        releaseNote: '',
        date: new Date().toString(),
        title: `Upgraded from ${previousVersion} to ${currentVerion}`,
      });
      return true;
    } catch (error) {
      console.log('check Version', error);
      throw new Error(error);
    }
  }
  static async viewUtxos() {
    try {
      const response = await RGBServices.getUnspents(
        ApiHandler.appType,
        ApiHandler.config,
      );
      const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );

      // Serialize the response to a JSON string for storage
      const utxosData = response.map(utxo => JSON.stringify(utxo));

      // Update the RgbWallet object with the UTXOs
      dbManager.updateObjectByPrimaryId(
        RealmSchema.RgbWallet,
        'mnemonic',
        rgbWallet.mnemonic,
        {
          utxos: utxosData, // Store the array
        },
      );

      return response;
    } catch (error) {
      console.log('utxos', error);
      throw new Error(error);
    }
  }

  static async restoreRgbFromCloud() {
    try {
      const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
      if (Platform.OS === 'android') {
        await NativeModules.CloudBackup.setup();
        const login = JSON.parse(await NativeModules.CloudBackup.login());
        if (login.status) {
          const restore = await RGBServices.restore(app.primaryMnemonic);
          console.log(restore);
          if (restore) {
            await ApiHandler.refreshRgbWallet();
          }
        }
      } else {
        const restore = await RGBServices.restore(app.primaryMnemonic);
        if (restore) {
          await ApiHandler.refreshRgbWallet();
        }
        console.log(restore);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static async backupRgbOnCloud() {
    try {
      const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
      const isBackupRequired = true;
      if (isBackupRequired) {
        if (Platform.OS === 'android') {
          await NativeModules.CloudBackup.setup();
          const login = JSON.parse(await NativeModules.CloudBackup.login());
          if (login.status) {
            const backup = await RGBServices.backup('', app.primaryMnemonic);
            if (backup.error) {
              dbManager.createObject(RealmSchema.CloudBackupHistory, {
                title: CloudBackupAction.CLOUD_BACKUP_FAILED,
                date: new Date().toString(),
                confirmed: true,
                subtitle: backup.error,
              });
            } else {
              dbManager.createObject(RealmSchema.CloudBackupHistory, {
                title: CloudBackupAction.CLOUD_BACKUP_CREATED,
                date: new Date().toString(),
                confirmed: true,
                subtitle: backup.file,
              });
            }
          } else {
            dbManager.createObject(RealmSchema.CloudBackupHistory, {
              title: CloudBackupAction.CLOUD_BACKUP_FAILED,
              date: new Date().toString(),
              confirmed: true,
              subtitle: login.error,
            });
          }
        } else {
          const backup = await RGBServices.backup('', app.primaryMnemonic);
          if (backup.error) {
            dbManager.createObject(RealmSchema.CloudBackupHistory, {
              title: CloudBackupAction.CLOUD_BACKUP_FAILED,
              date: new Date().toString(),
              confirmed: true,
              subtitle: backup.error,
            });
          } else {
            dbManager.createObject(RealmSchema.CloudBackupHistory, {
              title: CloudBackupAction.CLOUD_BACKUP_CREATED,
              date: new Date().toString(),
              confirmed: true,
              subtitle: backup.file,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  static async createBackup(confirmed) {
    try {
      dbManager.createObject(RealmSchema.BackupHistory, {
        title: confirmed
          ? BackupAction.SEED_BACKUP_CONFIRMED
          : BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED,
        date: new Date().toString(),
        confirmed,
        subtitle: '',
      });
      return true;
    } catch (error) {
      console.log('backup', error);
      throw new Error(error);
    }
  }
  static async getFeeAndExchangeRates() {
    const { exchangeRates, averageTxFees } =
      await Relay.fetchFeeAndExchangeRates();
    Storage.set(
      Keys.EXCHANGE_RATES,
      JSON.stringify(exchangeRates.exchangeRates),
    );
    await ApiHandler.getTxRates();
  }

  static async checkRgbNodeConnection(params: RgbNodeConnectParams) {
    try {
      const response = await new OtherApi(
        new Configuration({
          basePath: params.nodeUrl,
          accessToken: params.authentication,
        }),
      ).nodeinfoGet();
      if (response.status === 200) {
        console.log(response.data);
        return response.data;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }

  static async getNodeOnchainBtcAddress() {
    try {
      const response = await new OnChainApi(ApiHandler.config).addressPost();
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }

  static async getNodeOnchainBtcTransactions() {
    try {
      const response = await new OnChainApi(
        ApiHandler.config,
      ).listtransactionsPost({ skip_sync: false });
      if (response.status === 200) {
        console.log(response.data);
        return response.data;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }
}
