import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  TransactionKind,
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
import { MMKV } from 'react-native-mmkv';
import BIP85 from '../wallets/operations/BIP85';
import { RealmSchema } from 'src/storage/enum';
import WalletOperations from '../wallets/operations';
import ElectrumClient, { ELECTRUM_CLIENT } from '../electrum/client';
import {
  predefinedMainnetNodes,
  predefinedRegtestNodes,
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
  Asset,
  Collectible,
  IssuerVerificationMethod,
  NodeInfo,
  RgbNodeConnectParams,
  RGBWallet,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { BackupAction, CloudBackupAction } from 'src/models/enums/Backup';
import AppType from 'src/models/enums/AppType';
import { RLNNodeApiServices } from '../rgbnode/RLNNodeApi';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import Realm from 'realm';
import { hexToBase64 } from 'src/utils/hexToBase64';
import * as RNFS from '@dr.pogodin/react-native-fs';
import moment from 'moment';
import { NodeOnchainTransaction } from 'src/models/interfaces/Transactions';
import {
  getMessaging,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import BIP32Factory from 'bip32';
import ecc from '../wallets/operations/taproot-utils/noble_ecc';
import { SHA256 } from 'crypto-js';
import ECPairFactory from 'ecpair';
import { fetchAndVerifyTweet } from '../twitter';
import Toast from 'src/components/Toast';
const ECPair = ECPairFactory(ecc);

const bip32 = BIP32Factory(ecc);
const storage = new MMKV();

export class ApiHandler {
  private static app: RGBWallet;
  private static appType: AppType;
  private static api: RLNNodeApiServices;
  private static authToken: string;
  constructor(app: RGBWallet, appType: AppType, authToken: string) {
    if (!ApiHandler.app) {
      ApiHandler.app = app;
      ApiHandler.appType = appType;
      ApiHandler.authToken = authToken;
      if (appType === AppType.NODE_CONNECT) {
        ApiHandler.api = new RLNNodeApiServices({
          baseUrl: app.nodeUrl,
          apiKey: app.nodeAuthentication,
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

  static async loadGithubReleaseNotes(fullVersion: string) {
    try {
      const version = fullVersion.split('(')[0];
      const GITHUB_RELEASE_URL = `https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v${version}`;
      const response = await fetch(GITHUB_RELEASE_URL);
      if (!response.ok) {
        return {
          releaseNote: '',
        };
      }
      const releaseData = await response.json();
      dbManager.updateObjectByPrimaryId(
        RealmSchema.VersionHistory,
        'version',
        fullVersion,
        {
          releaseNote: releaseData.body || '',
        },
      );
      return {
        releaseNote: releaseData.body || '',
      };
    } catch (error) {
      return {
        releaseNote: '',
      };
    }
  }

  static async fetchGithubRelease() {
    try {
      const GITHUB_RELEASE_URL = `https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v${DeviceInfo.getVersion()}`;
      const response = await fetch(GITHUB_RELEASE_URL);
      if (!response.ok) {
        return {
          releaseNote: '',
        };
      }
      const releaseData = await response.json();
      return {
        releaseNote: releaseData.body || '',
      };
    } catch (error) {
      console.error('Error fetching GitHub release data:', error);
      return {
        releaseNote: '',
      };
    }
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
    authToken,
  }: {
    appName: string;
    pinMethod: PinMethod;
    passcode: '';
    walletImage: '';
    mnemonic: string;
    appType: AppType;
    rgbNodeConnectParams?: RgbNodeConnectParams;
    rgbNodeInfo?: NodeInfo;
    authToken: string;
  }) {
    Storage.set(Keys.SETUPAPP, true);
    Storage.set(Keys.PIN_METHOD, pinMethod);
    const hash = hash512(
      pinMethod !== PinMethod.DEFAULT
        ? passcode
        : config.ENC_KEY_STORAGE_IDENTIFIER,
    );
    // Check if the encrypted key already exists
    let AES_KEY: string;
    const existingEncryptedKey = await SecureStore.fetch(hash);
    if (!existingEncryptedKey) {
      // Generate a new AES key
      AES_KEY = generateEncryptionKey();
      // Encrypt the key using the hash
      const encryptedKey = encrypt(hash, AES_KEY);
      // Store the encrypted key securely
      await SecureStore.store(hash, encryptedKey);
    } else {
      // Decrypt the existing key to get AES_KEY
      AES_KEY = decrypt(hash, existingEncryptedKey);
    }
    const uint8array = stringToArrayBuffer(AES_KEY);

    const isRealmInit = await dbManager.initializeRealm(uint8array);
    if (isRealmInit) {
      try {
        const githubReleaseNote = await ApiHandler.fetchGithubRelease();
        if (appType === AppType.ON_CHAIN) {
          const primaryMnemonic = mnemonic
            ? mnemonic
            : bip39.generateMnemonic();
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
          const privateKeyHex = SHA256(appID).toString();
          const privateKey = Buffer.from(privateKeyHex, 'hex');
          const keyPair = ECPair.fromPrivateKey(privateKey);
          const publicKey = keyPair.publicKey.toString('hex');
          const challenge = await Relay.getChallenge(appID, publicKey);
          if (!challenge.challenge) {
            throw new Error('Failed to get challenge');
          }
          const messageHash = crypto
            .createHash('sha256')
            .update(challenge.challenge)
            .digest();
          const signature = keyPair
            .sign(Buffer.from(messageHash.toString('hex'), 'hex'))
            .toString('hex');
          const registerApp = await Relay.createNewApp(
            'Tribe-Onchain-Wallet',
            appID,
            publicId,
            publicKey,
            AppType.ON_CHAIN,
            'Iris_Regtest',
            '',
            signature,
          );
          if (!registerApp?.app?.authToken) {
            throw new Error('Failed to generate auth token');
          }
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
            authToken: registerApp?.app?.authToken,
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
              rgbWallet.accountXpubVanilla,
              rgbWallet.accountXpubColored,
            );
            Storage.set(Keys.APPID, appID);
            dbManager.createObject(RealmSchema.VersionHistory, {
              version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
              releaseNote: githubReleaseNote.releaseNote,
              date: new Date().toString(),
              title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            });
            const apiHandler = new ApiHandler(
              rgbWallet,
              AppType.ON_CHAIN,
              registerApp?.app?.authToken,
            );
          }
        } else if (appType === AppType.SUPPORTED_RLN) {
          let rgbWallet: RGBWallet = {
            mnemonic: rgbNodeConnectParams.mnemonic,
            xpub: '',
            rgbDir: '',
            accountXpubColored: '',
            accountXpubColoredFingerprint: '',
            accountXpubVanilla: '',
            nodeUrl: rgbNodeConnectParams.nodeUrl,
            nodeAuthentication: rgbNodeConnectParams.authentication,
            peerDNS: rgbNodeConnectParams?.peerDNS,
          };
          const apiHandler = new ApiHandler(
            rgbWallet,
            AppType.NODE_CONNECT,
            authToken,
          );

          rgbWallet.xpub = rgbNodeConnectParams.nodeId;
          rgbWallet.accountXpubColored = rgbNodeConnectParams.nodeId;
          rgbWallet.accountXpubColoredFingerprint = rgbNodeConnectParams.nodeId;
          rgbWallet.accountXpubVanilla = rgbNodeConnectParams.nodeId;
          const newAPP: TribeApp = {
            id: rgbNodeConnectParams.nodeId,
            publicId: rgbNodeConnectParams.nodeId,
            appName,
            walletImage,
            primaryMnemonic: rgbNodeConnectParams.mnemonic,
            primarySeed: rgbNodeConnectParams.nodeId,
            imageEncryptionKey: '',
            version: DeviceInfo.getVersion(),
            networkType: config.NETWORK_TYPE,
            enableAnalytics: true,
            appType: AppType.NODE_CONNECT,
            nodeInfo: rgbNodeInfo,
            nodeUrl: rgbNodeConnectParams.nodeUrl,
            nodeAuthentication: rgbNodeConnectParams.authentication,
            authToken,
          };

          const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
          if (created) {
            dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
            Storage.set(Keys.APPID, rgbNodeConnectParams.nodeId);
            dbManager.createObject(RealmSchema.VersionHistory, {
              version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
              releaseNote: githubReleaseNote.releaseNote,
              date: new Date().toString(),
              title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            });
          }
        } else {
          const privateKeyHex = SHA256(rgbNodeInfo.pubkey).toString();
          const privateKey = Buffer.from(privateKeyHex, 'hex');
          const keyPair = ECPair.fromPrivateKey(privateKey);
          const publicKey = keyPair.publicKey.toString('hex');
          const challenge = await Relay.getChallenge(
            rgbNodeInfo.pubkey,
            publicKey,
          );
          if (!challenge.challenge) {
            throw new Error('Failed to get challenge');
          }
          const messageHash = crypto
            .createHash('sha256')
            .update(challenge.challenge)
            .digest();
          const signature = keyPair
            .sign(Buffer.from(messageHash.toString('hex'), 'hex'))
            .toString('hex');
          const registerApp = await Relay.createNewApp(
            'Tribe-Node-Connect',
            rgbNodeInfo.pubkey,
            rgbNodeInfo.pubkey,
            publicKey,
            AppType.NODE_CONNECT,
            'Iris_Regtest',
            '',
            signature,
          );
          if (!registerApp?.app?.authToken) {
            throw new Error('Failed to generate auth token');
          }
          const newAPP: TribeApp = {
            id: rgbNodeInfo.pubkey,
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
            authToken: registerApp?.app?.authToken,
          };
          const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
          if (created) {
            const rgbWallet: RGBWallet = {
              mnemonic: rgbNodeInfo.pubkey,
              xpub: rgbNodeInfo.pubkey,
              rgbDir: '',
              accountXpubColored: rgbNodeInfo.pubkey,
              accountXpubColoredFingerprint: rgbNodeInfo.pubkey,
              accountXpubVanilla: rgbNodeInfo.pubkey,
              nodeUrl: rgbNodeConnectParams.nodeUrl,
              nodeAuthentication: rgbNodeConnectParams.authentication,
            };
            const apiHandler = new ApiHandler(rgbWallet, appType);
            dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
            Storage.set(Keys.APPID, rgbNodeInfo.pubkey);
            dbManager.createObject(RealmSchema.VersionHistory, {
              version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
              releaseNote: githubReleaseNote.releaseNote,
              date: new Date().toString(),
              title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            });
          }
        }
        Storage.set(Keys.SETUPAPP, false);
      } catch (error) {
        Storage.set(Keys.SETUPAPP, false);
        console.log(error);
        throw error;
      }
    } else {
      Storage.set(Keys.SETUPAPP, false);
      throw new Error('Realm initialisation failed');
    }
  }

  static async restoreWithBackupFile({
    mnemonic,
    filePath,
  }: {
    mnemonic: string;
    filePath: string;
  }) {
    try {
      const restore = await RGBServices.restore(mnemonic, filePath);
      if (restore.error) {
        throw new Error(restore.error);
      } else {
        ApiHandler.setupNewApp({
          appName: '',
          appType: AppType.ON_CHAIN,
          pinMethod: PinMethod.DEFAULT,
          passcode: '',
          walletImage: '',
          mnemonic: mnemonic,
        });
        dbManager.updateObjectByPrimaryId(
          RealmSchema.VersionHistory,
          'version',
          `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          {
            title: `Restored ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  static async restoreApp(mnemonic: string) {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const appID = crypto.createHash('sha256').update(seed).digest('hex');
      const backup = await Relay.getBackup(appID);
      if (backup.node) {
        ApiHandler.setupNewApp({
          appName: '',
          appType: AppType.SUPPORTED_RLN,
          pinMethod: PinMethod.DEFAULT,
          passcode: '',
          walletImage: '',
          rgbNodeConnectParams: {
            authentication: backup.token,
            nodeUrl: backup.apiUrl,
            mnemonic: backup.node.mnemonic,
            nodeId: backup.node.nodeId,
            peerDNS: backup.peerDNS,
          },
          mnemonic: backup.node.mnemonic,
          rgbNodeInfo: backup.nodeInfo,
        });
      } else if (backup.file) {
        var path = RNFS.DocumentDirectoryPath + `/${appID}.rgb_backup`;
        const file = await ApiHandler.downloadFile({
          fromUrl: backup.file,
          toFile: path,
        });
        const restore = await RGBServices.restore(mnemonic, path);
        await ApiHandler.setupNewApp({
          appName: '',
          appType: AppType.ON_CHAIN,
          pinMethod: PinMethod.DEFAULT,
          passcode: '',
          walletImage: '',
          mnemonic: mnemonic,
        });
        dbManager.updateObjectByPrimaryId(
          RealmSchema.VersionHistory,
          'version',
          `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          {
            title: `Restored ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          },
        );
      } else {
        throw new Error(backup.error);
      }
    } catch (error) {
      if (error! instanceof Error) {
        throw error;
      }
    }
  }

  static async downloadFile({ ...obj }: RNFS.DownloadFileOptionsT) {
    const { promise } = RNFS.downloadFile({
      progressDivider: 100,
      progressInterval: 5000,
      ...obj,
    });
    return promise;
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
    const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
    const rgbWallet: RGBWallet = await dbManager.getObjectByIndex(
      RealmSchema.RgbWallet,
    );
    const apiHandler = new ApiHandler(rgbWallet, app.appType, app.authToken);
    const isWalletOnline = await RGBServices.initiate(
      rgbWallet.mnemonic,
      rgbWallet.accountXpubVanilla,
      rgbWallet.accountXpubColored,
    );
    return { key, isWalletOnline };
  }

  static async createPin(pin: string) {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const newHash = hash512(pin);
    const encryptedKey = encrypt(newHash, key);
    SecureStore.store(newHash, encryptedKey);
    Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
  }

  static async changePin({ key, pin = '' }) {
    const hash = hash512(pin || config.ENC_KEY_STORAGE_IDENTIFIER);
    const encryptedKey = encrypt(hash, key);
    SecureStore.store(hash, encryptedKey);
    if (!pin) {
      Storage.set(Keys.PIN_METHOD, PinMethod.DEFAULT);
    }
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
      const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
      const apiHandler = new ApiHandler(rgbWallet, app.appType, app.authToken);
      const isWalletOnline = await RGBServices.initiate(
        rgbWallet.mnemonic,
        rgbWallet.accountXpubVanilla,
        rgbWallet.accountXpubColored,
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
      if (!key) {
        throw new Error('PIN not found');
      }
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
    const apiHandler = new ApiHandler(rgbWallet, app.appType, app.authToken);
    if (app.appType === AppType.NODE_CONNECT) {
      const nodeInfo = await ApiHandler.api.nodeinfo();
      if (nodeInfo.pubkey) {
        return { key, isWalletOnline: true };
      } else {
        return { key, isWalletOnline: false };
      }
    } else {
      const isWalletOnline = await RGBServices.initiate(
        rgbWallet.mnemonic,
        rgbWallet.accountXpubVanilla,
        rgbWallet.accountXpubColored,
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
        : config.NETWORK_TYPE === NetworkType.REGTEST
        ? predefinedRegtestNodes
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
        const balances = await ApiHandler.api.getBtcBalance({
          skip_sync: false,
        });
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
        const { synchedWallets }: { synchedWallets: Wallet[] } =
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

  static async payServiceFee({ feeDetails }): Promise<{ txid: string }> {
    const wallet: Wallet = dbManager
      .getObjectByIndex(RealmSchema.Wallet)
      .toJSON();
    const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
    const averageTxFeeByNetwork: AverageTxFeesByNetwork =
      JSON.parse(averageTxFeeJSON);
    const averageTxFee: AverageTxFees =
      averageTxFeeByNetwork[config.NETWORK_TYPE];
    const { low } = await ApiHandler.sendPhaseOne({
      sender: wallet,
      recipient: {
        address: feeDetails.address,
        amount: feeDetails.fee,
      },
      averageTxFee,
      selectedPriority: TxPriority.LOW,
    });
    const { txid } = await ApiHandler.sendToAddress({
      recipient: {
        address: feeDetails.address,
        amount: feeDetails.includeTxFee
          ? feeDetails.fee - low.fee
          : feeDetails.fee,
      },
      skipSync: false,
    });
    await ApiHandler.refreshWallets({ wallets: [wallet] });
    if (txid) {
      const updated = await ApiHandler.updateTransaction({
        txid,
        updateProps: {
          transactionKind: TransactionKind.SERVICE_FEE,
          metadata: {
            assetId: '',
            note: '',
          },
        },
      });
    }
    return { txid };
  }

  static async updateTransaction({
    txid,
    updateProps,
  }: {
    txid: string;
    updateProps: {};
  }): Promise<boolean> {
    try {
      const wallet: Wallet = dbManager
        .getObjectByIndex(RealmSchema.Wallet)
        .toJSON();
      const transactions = wallet.specs.transactions;
      const index = transactions.findIndex(tx => tx.txid === txid);
      transactions[index] = {
        ...transactions[index],
        ...updateProps,
      };
      dbManager.updateObjectByPrimaryId(RealmSchema.Wallet, 'id', wallet.id, {
        specs: {
          transactions: transactions,
          ...wallet.specs,
        },
      });
      return true;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  static async sendToAddress({
    recipient,
    skipSync = true,
  }: {
    recipient: { address: string; amount: number };
    skipSync: boolean;
  }): Promise<{ txid: string }> {
    const wallet = dbManager.getObjectByIndex(RealmSchema.Wallet).toJSON();
    const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
    const averageTxFeeByNetwork: AverageTxFeesByNetwork =
      JSON.parse(averageTxFeeJSON);
    const averageTxFee: AverageTxFees =
      averageTxFeeByNetwork[config.NETWORK_TYPE];
    const txPrerequisites = await ApiHandler.sendPhaseOne({
      sender: wallet,
      recipient,
      averageTxFee,
      selectedPriority: TxPriority.LOW,
    });

    if (!txPrerequisites) {
      throw new Error('Failed to generate txPrerequisites');
    }
    const { txid } = await ApiHandler.sendPhaseTwo({
      sender: wallet,
      recipient,
      txPrerequisites,
      txPriority: TxPriority.LOW,
    });
    if (!skipSync) {
      await ApiHandler.refreshWallets({ wallets: [wallet] });
    }
    return { txid };
  }

  static async sendTransaction({
    sender,
    recipient,
    averageTxFee,
    selectedPriority,
    txPrerequisites,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    averageTxFee: AverageTxFees;
    selectedPriority: TxPriority;
    txPrerequisites: TransactionPrerequisite;
  }): Promise<{ txid: string; txPrerequisites: TransactionPrerequisite }> {
    try {
      if (ApiHandler.appType === AppType.NODE_CONNECT) {
        const response = await ApiHandler.api.sendBTCTransaction({
          amount: recipient.amount,
          address: recipient.address,
          fee_rate: averageTxFee[selectedPriority].averageTxFee,
          skip_sync: false,
        });
        if (response) {
          const feeEstimate = await ApiHandler.api.estimateFee({ blocks: 7 });
          return {
            txid: response.txid,
            txPrerequisites: feeEstimate,
          };
        } else {
          throw new Error('Failed to connect to node');
        }
      } else {
        // const txPrerequisites = await ApiHandler.sendPhaseOne({
        //   sender,
        //   recipient,
        //   averageTxFee,
        //   selectedPriority,
        // });

        // if (!txPrerequisites) {
        //   throw new Error('Failed to generate txPrerequisites');
        // }
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
    } catch (error) {
      console.log({ error });
      throw new Error(error.message);
    }
  }

  static async receiveTestSats() {
    try {
      if (
        ApiHandler.appType === AppType.NODE_CONNECT ||
        ApiHandler.appType === AppType.SUPPORTED_RLN
      ) {
        const response = await ApiHandler.getNodeOnchainBtcAddress();
        if (response.address) {
          const { funded } = await Relay.getTestcoins(
            response.address,
            config.NETWORK_TYPE,
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
        const { receivingAddress: receivingAddress } =
          WalletOperations.getNextFreeExternalAddress(wallet);
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
          ApiHandler.api,
        );
        return utxos.created;
      } else {
        const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet);
        const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
        const averageTxFeeByNetwork: AverageTxFeesByNetwork =
          JSON.parse(averageTxFeeJSON);
        const averageTxFee = averageTxFeeByNetwork[wallet.networkType];
        const utxos = await RGBServices.createUtxos(
          averageTxFee.low.feePerByte,
          ApiHandler.appType,
          ApiHandler.api,
        );
        await ApiHandler.refreshRgbWallet();
        ApiHandler.refreshWallets({ wallets: wallet.toJSON() });
        if (utxos.created) {
          return utxos.created;
        }
        if (utxos.error) {
          throw new Error(`${utxos.error}`);
        } else {
          return false;
        }
      }
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  static async receiveAsset({ assetId, amount, linkedAsset, linkedAmount }) {
    try {
      assetId = assetId ?? '';
      amount = parseFloat(amount) ?? 0.0;
      const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      let response = await RGBServices.receiveAsset(
        ApiHandler.appType,
        ApiHandler.api,
        assetId,
        amount,
      );
      if (response.error) {
        throw new Error(response.error);
      } else {
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          { receiveData: response },
        );

        if (linkedAsset && linkedAmount !== 0) {
          const {
            recipientId,
            batchTransferIdx,
            expirationTimestamp,
            invoice,
          } = response;

          const updateData = {
            batchTransferIdx: batchTransferIdx || null,
            expirationTimestamp: expirationTimestamp || null,
            invoice: invoice || '',
            recipientId: recipientId || '',
            linkedAsset: linkedAsset || '',
            linkedAmount: linkedAmount || 0,
          };
          dbManager.createObject(RealmSchema.ReceiveUTXOData, updateData);
        }
      }
      ApiHandler.viewUtxos();
    } catch (error) {
      console.log('errors', error);
      throw error;
    }
  }

  static async receiveAssetOnLN({
    assetId,
    amount,
  }: {
    assetId?: string;
    amount?: number;
  }) {
    try {
      const response = await ApiHandler.api.lninvoice({
        amt_msat: 3000000,
        asset_id: assetId,
        asset_amount: Number(amount),
        expiry_sec: 4200,
      });
      if (response.invoice) {
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.log('errors', error);
      throw error;
    }
  }

  static async decodeLnInvoice({ invoice }: { invoice: string }) {
    try {
      const response = await ApiHandler.api.decodelninvoice({ invoice });
      if (response.payment_hash) {
        return snakeCaseToCamelCaseCase(response);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.log('errors', error);
      throw error;
    }
  }

  static async sendLNPayment({ invoice }: { invoice: string }) {
    try {
      const response = await ApiHandler.api.sendPayment({ invoice });
      if (response.payment_hash) {
        return snakeCaseToCamelCaseCase(response);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.log('errors', error);
      throw error;
    }
  }

  static async listPayments() {
    try {
      const response = await ApiHandler.api.listpayments();
      if (response.payments && Array.isArray(response.payments)) {
        const rgbWallet: RGBWallet[] = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        );
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            lnPayments: response?.payments,
          },
        );
        return snakeCaseToCamelCaseCase(response.payments);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.log('payments', error);
      throw error;
    }
  }

  static async refreshRgbWallet() {
    try {
      let assets = await RGBServices.syncRgbAssets(
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (assets.nia) {
        dbManager.createObjectBulk(
          RealmSchema.Coin,
          assets.nia,
          Realm.UpdateMode.Modified,
        );
      }
      if (assets.cfa) {
        const cfas = [];
        if (ApiHandler.appType === AppType.NODE_CONNECT) {
          for (let i = 0; i < assets.cfa.length; i++) {
            const collectible: Collectible = assets.cfa[i];
            const mediaByte = await ApiHandler.api.getassetmedia({
              digest: collectible.media.digest,
            });
            const { base64, fileType } = hexToBase64(mediaByte.bytes_hex);
            const ext = assets.cfa[i].media.mime.split('/')[1];
            const path = `${RNFS.DocumentDirectoryPath}/${collectible.media.digest}.${ext}`;
            await RNFS.writeFile(path, base64, 'base64');
            cfas.push({
              ...assets.cfa[i],
              media: {
                ...assets.cfa[i].media,
                filePath: path,
              },
            });
          }
        }
        if (Platform.OS === 'ios' && ApiHandler.appType === AppType.ON_CHAIN) {
          for (const element of assets.cfa) {
            const ext = element.media.mime.split('/')[1];
            const destination = `${element.media.filePath}.${ext}`;

            if (!(await RNFS.exists(destination))) {
              await RNFS.copyFile(element.media.filePath, destination);
            }

            cfas.push({
              ...element,
              media: {
                ...element.media,
                filePath: destination,
              },
            });
          }
        } else {
          cfas.push(...assets.cfa);
        }
        dbManager.createObjectBulk(
          RealmSchema.Collectible,
          cfas,
          Realm.UpdateMode.Modified,
        );
      }

      if (assets.uda) {
        const udas = [];
        if (ApiHandler.appType === AppType.NODE_CONNECT) {
          // todo
        }
        if (ApiHandler.appType === AppType.ON_CHAIN) {
          for (let i = 0; i < assets.uda.length; i++) {
            const uda: UniqueDigitalAsset = assets.uda[i];
            assets.uda[i].token.attachments = Object.values(
              uda.token.attachments,
            );
            uda.token.attachments = Object.values(uda.token.attachments);
            if (Platform.OS === 'ios') {
              const ext = uda.token.media.mime.split('/')[1];
              const destination = `${uda.token.media.filePath}.${ext}`;
              const exists = await RNFS.exists(destination);
              if (!exists) {
                await RNFS.copyFile(
                  uda.token.media.filePath,
                  `${uda.token.media.filePath}.${ext}`,
                );
              }
              // assets.uda[i].token.media.filePath = destination;
              uda.token.media = {
                ...uda.token.media,
                filePath: destination,
              };
              for (let j = 0; j < uda.token.attachments.length; j++) {
                const attachment = uda.token.attachments[j];
                const ex = attachment.mime.split('/')[1];
                const dest = `${attachment.filePath}.${ex}`;
                const isexists = await RNFS.exists(dest);
                if (!isexists) {
                  await RNFS.copyFile(
                    attachment.filePath,
                    `${attachment.filePath}.${ex}`,
                  );
                  // assets.uda[i].token.attachments[j].filePath = dest;
                }
                uda.token.attachments[j] = {
                  ...uda.token.attachments[j],
                  filePath: dest,
                };
              }
            }
            udas.push(uda);
          }
        }
        dbManager.createObjectBulk(
          RealmSchema.UniqueDigitalAsset,
          udas,
          Realm.UpdateMode.Modified,
        );
      }
      await ApiHandler.updateAssetVerificationStatus();
    } catch (error) {
      console.log('error', error);
    }
  }

  static async issueNewCoin({
    name,
    ticker,
    supply,
    precision,
    addToRegistry = true,
  }: {
    name: string;
    ticker: string;
    supply: string;
    precision: number;
    addToRegistry;
  }) {
    try {
      const response = await RGBServices.issueAssetNia(
        ticker,
        name,
        `${supply}`,
        precision,
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (response?.assetId) {
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        const metadata = await RGBServices.getRgbAssetMetaData(
          response?.assetId,
          ApiHandler.appType,
          ApiHandler.api,
        );
        if (addToRegistry) {
          await Relay.registerAsset(app.id, { ...metadata, ...response });
          const wallet: Wallet = dbManager
            .getObjectByIndex(RealmSchema.Wallet)
            .toJSON();
          const tx = wallet.specs.transactions.find(
            tx =>
              tx.transactionKind === TransactionKind.SERVICE_FEE &&
              tx.metadata?.assetId === '',
          );
          if (tx) {
            ApiHandler.updateTransaction({
              txid: tx.txid,
              updateProps: {
                metadata: {
                  assetId: response.assetId,
                  note: `Issued ${response.name} on ${moment().format(
                    'DD MMM YY  •  hh:mm A',
                  )}`,
                },
              },
            });
          }
        }
        await ApiHandler.refreshRgbWallet();
      }
      return response;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  static async issueNewCollectible({
    name,
    description,
    supply,
    filePath,
    precision,
    addToRegistry = true,
  }: {
    name: string;
    description: string;
    supply: string;
    filePath: string;
    precision: number;
    addToRegistry: boolean;
  }) {
    try {
      const response = await RGBServices.issueAssetCfa(
        name,
        description,
        `${supply}`,
        precision,
        filePath,
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (response?.assetId) {
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        await ApiHandler.refreshRgbWallet();
        const collectible = dbManager.getObjectByPrimaryId(
          RealmSchema.Collectible,
          'assetId',
          response?.assetId,
        ) as unknown as Collectible;
        if (addToRegistry) {
          await Relay.registerAsset(app.id, { ...collectible });
          const wallet: Wallet = dbManager
            .getObjectByIndex(RealmSchema.Wallet)
            .toJSON();
          const tx = wallet.specs.transactions.find(
            tx =>
              tx.transactionKind === TransactionKind.SERVICE_FEE &&
              tx.metadata?.assetId === '',
          );
          if (tx) {
            ApiHandler.updateTransaction({
              txid: tx.txid,
              updateProps: {
                metadata: {
                  assetId: response.assetId,
                  note: `Issued ${response.name} on ${moment().format(
                    'DD MMM YY  •  hh:mm A',
                  )}`,
                },
              },
            });
          }
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async issueAssetUda({
    name,
    ticker,
    details,
    mediaFilePath,
    attachmentsFilePaths,
    addToRegistry = true,
  }: {
    name: string;
    ticker: string;
    details: string;
    mediaFilePath: string;
    attachmentsFilePaths: string[];
    addToRegistry;
  }) {
    try {
      const response = await RGBServices.issueAssetUda(
        name,
        ticker,
        details,
        mediaFilePath,
        attachmentsFilePaths,
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (response?.assetId) {
        await ApiHandler.refreshRgbWallet();
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        const collectible = dbManager.getObjectByPrimaryId(
          RealmSchema.UniqueDigitalAsset,
          'assetId',
          response?.assetId,
        ) as unknown as Collectible;
        if (addToRegistry) {
          await Relay.registerAsset(app.id, { ...collectible });
          const wallet: Wallet = dbManager
            .getObjectByIndex(RealmSchema.Wallet)
            .toJSON();
          const tx = wallet.specs.transactions.find(
            tx =>
              tx.transactionKind === TransactionKind.SERVICE_FEE &&
              tx.metadata?.assetId === '',
          );
          if (tx) {
            ApiHandler.updateTransaction({
              txid: tx.txid,
              updateProps: {
                metadata: {
                  assetId: response.assetId,
                  note: `Issued ${response.name} on ${moment().format(
                    'DD MMM YY  •  hh:mm A',
                  )}`,
                },
              },
            });
          }
        }
      }
      return response;
    } catch (error) {
      throw error;
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
        ApiHandler.api,
      );
      if (response.length > 0) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          transactions: response,
        });
      }
      if (ApiHandler.appType === AppType.NODE_CONNECT) {
        const balances = await ApiHandler.api.assetbalance({
          asset_id: assetId,
        });
        if (balances && balances.future) {
          dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
            balance: snakeCaseToCamelCaseCase(balances),
          });
        }
      }
      return response;
    } catch (error) {
      console.log('refreshRgbWallet', error);
      throw error;
    }
  }

  static async sendAsset({
    assetId,
    blindedUTXO,
    amount,
    consignmentEndpoints,
    feeRate,
    isDonation,
  }: {
    assetId: string;
    blindedUTXO: string;
    amount: number;
    consignmentEndpoints: string;
    feeRate: number;
    isDonation: boolean;
  }) {
    try {
      const response = await RGBServices.sendAsset(
        assetId,
        blindedUTXO,
        amount,
        consignmentEndpoints,
        feeRate,
        isDonation,
        ApiHandler.appType,
        ApiHandler.api,
      );
      return response;
    } catch (error) {
      console.log('sendAsset', error);
      throw error;
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
        ApiHandler.api,
      );
      if (response) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          metaData: response,
        });
      }
      return response;
    } catch (error) {
      console.log('refreshRgbWallet', error);
      throw error;
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
      throw error;
    }
  }

  static async checkVersion() {
    try {
      const githubReleaseNote = await ApiHandler.fetchGithubRelease();
      const versionHistoryData = dbManager.getCollection(
        RealmSchema.VersionHistory,
      );
      const lastIndex = versionHistoryData.length - 1;
      const version = dbManager.getObjectByIndex(
        RealmSchema.VersionHistory,
        lastIndex,
      );
      const currentVersion = `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`;
      if (version?.version !== currentVersion) {
        dbManager.createObject(RealmSchema.VersionHistory, {
          version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: githubReleaseNote.releaseNote,
          date: new Date().toString(),
          title: `Upgraded from ${version.version} to ${currentVersion}`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('check Version', error);
      throw error;
    }
  }

  static async syncFcmToken(): Promise<boolean> {
    try {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied on Android');
          return false;
        }
      }
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        return false;
      }
      const token = await getToken(messaging);
      if (token === Storage.get(Keys.FCM_TOKEN)) {
        return true;
      }
      const response = await Relay.syncFcmToken(ApiHandler.authToken, token);

      if (response.updated) {
        Storage.set(Keys.FCM_TOKEN, token);
        return true;
      }
      return false;
    } catch (error) {
      console.log('fcm update error: ', error);
      throw error;
    }
  }
  static async viewUtxos() {
    try {
      const response = await RGBServices.getUnspents(
        ApiHandler.appType,
        ApiHandler.api,
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  }
  static async getFeeAndExchangeRates() {
    const { exchangeRates, serviceFee } =
      await Relay.fetchFeeAndExchangeRates();
    Storage.set(
      Keys.EXCHANGE_RATES,
      JSON.stringify(exchangeRates.exchangeRates),
    );
    Storage.set(Keys.SERVICE_FEE, JSON.stringify(serviceFee));
    await ApiHandler.getTxRates();
  }

  static async checkRgbNodeConnection(params: RgbNodeConnectParams) {
    try {
      const response = await RLNNodeApiServices.checkNodeConnection(
        params.nodeUrl,
        params.authentication,
      );
      if (response.error) {
        throw new Error(response.error);
      } else if (response) {
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getNodeOnchainBtcAddress() {
    try {
      const response = await ApiHandler.api.getAddress({});
      if (response) {
        return response;
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
      const response = await ApiHandler.api.listTransactions({
        skip_sync: false,
      });
      if (response && Array.isArray(response.transactions)) {
        const rgbWallet: RGBWallet[] = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        );

        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            nodeOnchainTransactions: response?.transactions,
          },
        );
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log('error- ', error);
      throw new Error('Failed to connect to node');
    }
  }

  static async viewNodeInfo() {
    try {
      const response = await ApiHandler.api.nodeinfo();
      if (response) {
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }

  static async getassetmedia(digest: string) {
    try {
      const response = await ApiHandler.api.getassetmedia({ digest });
      if (response) {
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }

  static async openChannel({
    peerPubkeyAndOptAddr,
    capacitySat,
    pushMsat,
    assetAmount,
    assetId,
    isPublic,
    withAnchors,
    feeBaseMsat,
    feeProportionalMillionths,
    temporaryChannelId,
  }: {
    peerPubkeyAndOptAddr: string;
    capacitySat: number;
    pushMsat: number;
    assetAmount: number;
    assetId: string;
    isPublic: boolean;
    withAnchors: boolean;
    feeBaseMsat: number;
    feeProportionalMillionths: number;
    temporaryChannelId: string;
  }) {
    try {
      const response = await ApiHandler.api.openchannel({
        asset_amount: assetAmount,
        asset_id: assetId,
        capacity_sat: capacitySat,
        fee_base_msat: feeBaseMsat,
        fee_proportional_millionths: feeProportionalMillionths,
        peer_pubkey_and_opt_addr: peerPubkeyAndOptAddr,
        public: isPublic,
        push_msat: pushMsat,
        //temporary_channel_id: temporaryChannelId,
        with_anchors: withAnchors,
      });
      if (response.error) {
        if (response.name === 'NoAvailableUtxos') {
          const createUtxos = await ApiHandler.api.createutxos({
            fee_rate: 1,
            num: 1,
            size: capacitySat,
            skip_sync: false,
            up_to: false,
          });
          if (createUtxos) {
            await ApiHandler.openChannel({
              peerPubkeyAndOptAddr,
              capacitySat,
              pushMsat,
              assetAmount,
              assetId,
              isPublic,
              withAnchors,
              feeBaseMsat,
              feeProportionalMillionths,
              temporaryChannelId,
            });
          }
        } else {
          throw new Error(response.error);
        }
      } else if (response) {
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async closeChannel({
    channelId,
    peerPubKey,
  }: {
    channelId: string;
    peerPubKey: number;
  }) {
    try {
      const response = await ApiHandler.api.closechannel({
        channel_id: channelId,
        peer_pubkey: peerPubKey,
        force: false,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getChannels() {
    try {
      const response = await ApiHandler.api.listchannels();
      if (response && response.channels) {
        return snakeCaseToCamelCaseCase(response).channels;
      } else {
        return snakeCaseToCamelCaseCase(response);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async syncNode() {
    try {
      const response = await ApiHandler.api.sync();
      if (response) {
        return response;
      } else {
        throw new Error('Failed to sync node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createSupportedNode() {
    try {
      const response = await Relay.createSupportedNode();
      if (response.error) {
        throw new Error(response.error);
      } else if (response) {
        return response;
      } else {
        throw new Error('Failed to create node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async unlockNode() {
    try {
      const response = await ApiHandler.api.unlock('tribe@2024');
      console.log(response);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response) {
        return response;
      } else {
        throw new Error('Failed to unlock node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getAssetBalance(assetId: string) {
    try {
      const response = await ApiHandler.api.assetbalance({
        asset_id: assetId,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      if (response) {
        return snakeCaseToCamelCaseCase(response);
      } else {
        throw new Error('Failed to unlock node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async backup() {
    try {
      const app: TribeApp = dbManager.getObjectByIndex<TribeApp>(
        RealmSchema.TribeApp,
      ) as TribeApp;
      const wallet: RGBWallet = dbManager.getObjectByIndex<RGBWallet>(
        RealmSchema.RgbWallet,
      ) as RGBWallet;
      const isBackupRequired = await RGBServices.isBackupRequired();
      if (isBackupRequired) {
        const backupFile = await RGBServices.backup('', app.primaryMnemonic);
        if (backupFile.file) {
          const response = await Relay.rgbFileBackup(
            Platform.select({
              android: `file://${backupFile.file}`,
              ios: backupFile.file,
            }),
            app.id,
            wallet.accountXpubColoredFingerprint,
          );
          if (response.uploaded) {
            Storage.set(Keys.RGB_ASSET_RELAY_BACKUP, Date.now());
          }
        }
      }
    } catch (error) {
      console.log('backup error', error);
    }
  }

  static async isBackupRequired() {
    try {
      return await RGBServices.isBackupRequired();
    } catch (error) {
      throw error;
    }
  }

  static async initNode() {
    try {
      const response = await ApiHandler.api.init({
        password: 'tribe@2024',
      });
      if (response.mnemonic) {
        const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        );
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            nodeMnemonic: response.mnemonic,
          },
        );
        return response;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error('Failed to init node');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async handleTransferFailure(
    batchTransferIdx: Number,
    noAssetOnly: boolean,
  ) {
    try {
      const response = await RGBServices.failTransfer(
        batchTransferIdx,
        noAssetOnly,
      );
      if (response.status) {
        return response;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error('Error - Canceling transfer ');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async decodeInvoice(invoiceString: string) {
    try {
      const response = await RGBServices.decodeInvoice(invoiceString);
      if (response.recipientId) {
        return response;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error('Error - Canceling transfer ');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateAssetVerificationStatus() {
    try {
      const getUnverifiedAssets = (schema: RealmSchema) =>
        dbManager
          .getCollection(schema)
          .filter(asset => !asset.issuer || asset?.issuer?.verified === false);

      const schemas = [
        { schema: RealmSchema.Coin, type: 'coin' },
        { schema: RealmSchema.Collectible, type: 'collectible' },
        { schema: RealmSchema.UniqueDigitalAsset, type: 'uda' },
      ];

      const assetIds = schemas.flatMap(({ schema }) =>
        getUnverifiedAssets(schema).map(asset => asset.assetId),
      );
      if (assetIds.length === 0) return;
      const response = await Relay.getAssetsVerificationStatus(assetIds);
      if (!response.status) {
        throw new Error(
          response.error || 'Failed to update asset verification status',
        );
      }
      if (response?.records) {
        for (const { assetId, issuer, iconUrl } of response.records) {
          for (const { schema } of schemas) {
            const asset = dbManager
              .getCollection(schema)
              .find(a => a.assetId === assetId);
            if (asset) {
              dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
                issuer,
                iconUrl,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async resetApp(key: string) {
    try {
      const uint8array = stringToArrayBuffer(key);
      await dbManager.deleteRealm(uint8array);
      Storage.clear();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static validateTweetForAsset = async (
    tweetId: string,
    assetId: string,
    schema: RealmSchema,
    asset: Asset,
  ): Promise<{ success: boolean; tweet?: any; reason?: string }> => {
    try {
      const response = await fetchAndVerifyTweet(tweetId);
      if (response.status === 429) {
        const resetAfter = response.headers.get('x-rate-limit-reset');
        const now = Math.floor(Date.now() / 1000);
        const waitTime = resetAfter ? Number(resetAfter) - now : null;
        if (waitTime && waitTime > 0) {
          Toast(
            `You’ve reached the tweet fetch limit. Try again in ${waitTime}s (around ${new Date(
              Number(resetAfter) * 1000,
            ).toLocaleTimeString()}).`,
            true,
          );
        }

        return {
          success: false,
          reason:
            'Too many requests to Twitter. Try again after a short break.',
        };
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        if (errorJson?.title === 'UsageCapExceeded') {
          return {
            success: false,
            reason: 'Twitter API usage cap exceeded. Please try again later.',
          };
        }
        const message =
          errorJson?.title ||
          errorJson?.detail ||
          `HTTP error ${response.status}`;
        return { success: false, reason: message };
      }

      const data = await response.json();
      const tweet = data?.data;
      console.log('tweet', tweet);
      if (!tweet) {
        return { success: false, reason: 'Tweet not found' };
      }

      if (tweet.text.includes(assetId)) {
        const response = await Relay.verifyIssuer('appID', asset.assetId, {
          type: IssuerVerificationMethod.TWITTER_POST,
          link: tweetId,
          id: asset?.issuer?.verifiedBy?.find(
            v => v.type === IssuerVerificationMethod.TWITTER,
          )?.id,
          name: asset?.issuer?.verifiedBy?.find(
            v => v.type === IssuerVerificationMethod.TWITTER,
          )?.name,
          username: asset?.issuer?.verifiedBy?.find(
            v => v.type === IssuerVerificationMethod.TWITTER,
          )?.username,
        });
        if (response.status) {
          const existingAsset = await dbManager.getObjectByPrimaryId(
            schema,
            'assetId',
            asset.assetId,
          );

          const existingVerifiedBy = existingAsset?.issuer?.verifiedBy || [];
          const twitterEntry = asset?.issuer?.verifiedBy?.find(
            v => v.type === IssuerVerificationMethod.TWITTER,
          );

          if (!twitterEntry) return;
          let updatedVerifiedBy: typeof existingVerifiedBy;
          const twitterPostIndex = existingVerifiedBy.findIndex(
            v => v.type === IssuerVerificationMethod.TWITTER_POST,
          );

          if (twitterPostIndex !== -1) {
            updatedVerifiedBy = [...existingVerifiedBy];
            updatedVerifiedBy[twitterPostIndex] = {
              ...updatedVerifiedBy[twitterPostIndex],
              link: tweetId,
            };
          } else {
            updatedVerifiedBy = [
              ...existingVerifiedBy,
              {
                type: IssuerVerificationMethod.TWITTER_POST,
                link: tweetId,
                id: twitterEntry.id,
                name: twitterEntry.name,
                username: twitterEntry.username,
              },
            ];
          }

          await dbManager.updateObjectByPrimaryId(
            schema,
            'assetId',
            asset.assetId,
            {
              issuer: {
                verified: true,
                verifiedBy: updatedVerifiedBy,
              },
            },
          );
        }
        return { success: true, tweet };
      } else {
        return { success: false, reason: 'Asset ID not found in tweet text' };
      }
    } catch (error: any) {
      console.error('Twitter API error:', error.message || error);
      return { success: false, reason: 'Network or fetch error' };
    }
  };
  static searchAssetFromRegistry = async (
    query: string,
  ): Promise<{ asset?: Asset }> => {
    try {
      const response = await Relay.registryAssetSearch(query);
      return response;
    } catch (error: any) {
      console.error('Twitter API error:', error.message || error);
      return error;
    }
  };

  static fetchPresetAssets = async () => {
    try {
      const response = await Relay.getPresetAssets();
      if (response && response.coins) {
        for (const coin of response.coins) {
          dbManager.createObjectBulk(
            RealmSchema.Coin,
            [coin],
            Realm.UpdateMode.Modified,
          );
        }
      }
    } catch (error: any) {
      return error;
    }
  };
}
