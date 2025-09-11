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
  Coin,
  Collectible,
  InvoiceType,
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
import {
  getMessaging,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import ecc from '../wallets/operations/taproot-utils/noble_ecc';
import { SHA256 } from 'crypto-js';
import ECPairFactory from 'ecpair';
import { fetchAndVerifyTweet } from '../twitter';
import Toast from 'src/components/Toast';
import ChatPeerManager from '../p2p/ChatPeerManager';
import { Asset as ImageAsset } from 'react-native-image-picker';
const ECPair = ECPairFactory(ecc);

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
      if (
        appType === AppType.NODE_CONNECT ||
        appType === AppType.SUPPORTED_RLN
      ) {
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
    appName = "Satoshi's Palette",
    pinMethod = PinMethod.DEFAULT,
    passcode = '',
    walletImage = null,
    mnemonic = null,
    appType,
    rgbNodeConnectParams,
    rgbNodeInfo,
    authToken,
  }: {
    appName: string;
    pinMethod: PinMethod;
    passcode: '';
    walletImage: ImageAsset;
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
          const cm = ChatPeerManager.getInstance();
          await cm.init(primarySeed.toString('hex'));
          const keys = await cm.getKeys();
          const registerApp = await Relay.createNewApp(
            appName,
            appID,
            publicId,
            publicKey,
            AppType.ON_CHAIN,
            config.NETWORK_TYPE,
            '',
            signature,
            walletImage,
            keys.publicKey,
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
            walletImage: registerApp?.app?.imageUrl || '',
            primaryMnemonic,
            primarySeed: primarySeed.toString('hex'),
            imageEncryptionKey,
            version: DeviceInfo.getVersion(),
            networkType: config.NETWORK_TYPE,
            enableAnalytics: true,
            appType,
            authToken: registerApp?.app?.authToken,
            contactsKey: {
              publicKey: keys.publicKey,
              secretKey: keys.secretKey,
            },
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
              rgbWallet.masterFingerprint,
            );
            Storage.set(Keys.APPID, appID);
            dbManager.createObject(RealmSchema.VersionHistory, {
              version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
              releaseNote: githubReleaseNote.releaseNote,
              date: new Date().toString(),
              title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            });
            // await ApiHandler.manageFcmVersionTopics();
            const apiHandler = new ApiHandler(
              rgbWallet,
              AppType.ON_CHAIN,
              registerApp?.app?.authToken,
            );
          }
        } else if (
          appType === AppType.SUPPORTED_RLN ||
          appType === AppType.NODE_CONNECT
        ) {
          let rgbWallet: RGBWallet = {
            mnemonic:
              rgbNodeConnectParams.mnemonic || rgbNodeConnectParams.nodeId,
            xpub: '',
            rgbDir: '',
            accountXpubColored: '',
            masterFingerprint: '',
            accountXpubVanilla: '',
            nodeUrl: rgbNodeConnectParams.nodeUrl,
            nodeAuthentication: rgbNodeConnectParams.authentication,
            peerDNS: rgbNodeConnectParams?.peerDNS,
          };
          const apiHandler = new ApiHandler(
            rgbWallet,
            appType === AppType.SUPPORTED_RLN
              ? AppType.SUPPORTED_RLN
              : AppType.NODE_CONNECT,
            authToken,
          );
          rgbWallet.xpub = rgbNodeConnectParams.nodeId;
          rgbWallet.accountXpubColored = rgbNodeConnectParams.nodeId;
          rgbWallet.masterFingerprint = rgbNodeConnectParams.nodeId;
          rgbWallet.accountXpubVanilla = rgbNodeConnectParams.nodeId;
          const newAPP: TribeApp = {
            id: rgbNodeConnectParams.nodeId,
            publicId: rgbNodeConnectParams.nodeId,
            appName,
            walletImage: '',
            primaryMnemonic:
              rgbNodeConnectParams.mnemonic || rgbNodeConnectParams.nodeId,
            primarySeed: rgbNodeConnectParams.nodeId,
            imageEncryptionKey: '',
            version: DeviceInfo.getVersion(),
            networkType: config.NETWORK_TYPE,
            enableAnalytics: true,
            appType:
              appType === AppType.SUPPORTED_RLN
                ? AppType.SUPPORTED_RLN
                : AppType.NODE_CONNECT,
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
            // await ApiHandler.manageFcmVersionTopics();
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
          const cm = ChatPeerManager.getInstance();
          if (!rgbNodeConnectParams.nodeId) {
            throw new Error('Missing nodeId');
          }
          await cm.init(rgbNodeConnectParams.nodeId);
          const keys = await cm.getKeys();
          const registerApp = await Relay.createNewApp(
            'Tribe-Node-Connect',
            rgbNodeInfo.pubkey,
            rgbNodeInfo.pubkey,
            publicKey,
            AppType.NODE_CONNECT,
            config.NETWORK_TYPE,
            '',
            signature,
            walletImage,
            keys.publicKey,
          );
          if (!registerApp?.app?.authToken) {
            throw new Error('Failed to generate auth token');
          }
          const newAPP: TribeApp = {
            id: rgbNodeInfo.pubkey,
            publicId: rgbNodeInfo.pubkey,
            appName,
            walletImage: registerApp?.app?.imageUrl || '',
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
            contactsKey: {
              publicKey: keys.publicKey,
              secretKey: keys.secretKey,
            },
          };
          const created = dbManager.createObject(RealmSchema.TribeApp, newAPP);
          if (created) {
            const rgbWallet: RGBWallet = {
              mnemonic: rgbNodeInfo.pubkey,
              xpub: rgbNodeInfo.pubkey,
              rgbDir: '',
              accountXpubColored: rgbNodeInfo.pubkey,
              masterFingerprint: rgbNodeInfo.pubkey,
              accountXpubVanilla: rgbNodeInfo.pubkey,
              nodeUrl: rgbNodeConnectParams.nodeUrl,
              nodeAuthentication: rgbNodeConnectParams.authentication,
            };
            const apiHandler = new ApiHandler(
              rgbWallet,
              appType,
              registerApp?.app?.authToken,
            );
            dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
            Storage.set(Keys.APPID, rgbNodeInfo.pubkey);
            dbManager.createObject(RealmSchema.VersionHistory, {
              version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
              releaseNote: githubReleaseNote.releaseNote,
              date: new Date().toString(),
              title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
            });
            // await ApiHandler.manageFcmVersionTopics();
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
        // await ApiHandler.manageFcmVersionTopics();
      }
    } catch (error) {
      throw error;
    }
  }

  static async restoreApp(mnemonic: string) {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const publicId = WalletUtilities.getFingerprintFromSeed(seed);
      const appID = crypto.createHash('sha256').update(publicId).digest('hex');
      const backup = await Relay.getBackup(publicId.toLowerCase());
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
        // await ApiHandler.manageFcmVersionTopics();
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
    // const cm = ChatPeerManager.getInstance();
    // await cm.init(app.primarySeed);
    // const apiHandler = new ApiHandler(rgbWallet, app.appType, app.authToken);
    // const isWalletOnline = await RGBServices.initiate(
    //   rgbWallet.mnemonic,
    //   rgbWallet.accountXpubVanilla,
    //   rgbWallet.accountXpubColored,
    //   rgbWallet.masterFingerprint,
    // );
    return { key, isWalletOnline: false };
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
      return { key, isWalletOnline: false };
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
    return { key, isWalletOnline: false };
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
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
        rgbWallet.masterFingerprint,
      );
      // const cm = ChatPeerManager.getInstance();
      // await cm.init(app.primarySeed);
      return { key, isWalletOnline };
    }
  }

  static async makeWalletOnline(): Promise<boolean> {
    try {
      const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
      const rgbWallet: RGBWallet = await dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      if (
        app.appType === AppType.NODE_CONNECT ||
        app.appType === AppType.SUPPORTED_RLN
      ) {
        const nodeInfo = await ApiHandler.api.nodeinfo();
        if (nodeInfo.pubkey) {
          return true;
        } else {
          return false;
        }
      } else {
        const isWalletOnline = await RGBServices.initiate(
          rgbWallet.mnemonic,
          rgbWallet.accountXpubVanilla,
          rgbWallet.accountXpubColored,
          rgbWallet.masterFingerprint,
        );
        console.log('isWalletOnline', isWalletOnline);
        // const cm = ChatPeerManager.getInstance();
        // await cm.init(app.primarySeed);
        return isWalletOnline === true;
      }
    } catch (error) {
      console.log(error);
      return false;
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
      if (
        ApiHandler.appType === AppType.NODE_CONNECT ||
        ApiHandler.appType === AppType.SUPPORTED_RLN
      ) {
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
    if (!averageTxFeeJSON) {
      throw new Error(
        'Transaction fee data not found. Please try again later.',
      );
    }
    let averageTxFeeByNetwork: AverageTxFeesByNetwork;
    try {
      averageTxFeeByNetwork = JSON.parse(averageTxFeeJSON);
    } catch (error) {
      throw new Error(
        'Invalid transaction fee data. Please refresh and try again.',
      );
    }
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
      await ApiHandler.updateTransaction({
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
      if (
        ApiHandler.appType === AppType.NODE_CONNECT ||
        ApiHandler.appType === AppType.SUPPORTED_RLN
      ) {
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
      if (
        ApiHandler.appType === AppType.NODE_CONNECT ||
        ApiHandler.appType === AppType.SUPPORTED_RLN
      ) {
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

  static async receiveAsset({
    assetId,
    amount,
    linkedAsset,
    linkedAmount,
    expiry,
    blinded = true,
  }) {
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
        expiry,
        blinded,
      );
      if (response.error) {
        throw new Error(response.error);
      } else {
        const invoices = [...rgbWallet?.invoices, response];
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          { receiveData: response, invoices: invoices },
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
    expiry,
  }: {
    assetId?: string;
    amount?: number;
    expiry?: number;
  }) {
    try {
      const response = await ApiHandler.api.lninvoice({
        amt_msat: 3000000,
        asset_id: assetId,
        asset_amount: Number(amount),
        expiry_sec: expiry,
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
      throw error;
    }
  }

  static async refreshRgbWallet() {
    try {
      let assets = await RGBServices.syncRgbAssets(
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (assets?.nia) {
        dbManager.createObjectBulk(
          RealmSchema.Coin,
          assets.nia,
          Realm.UpdateMode.Modified,
        );
      }
      if (assets?.cfa) {
        const cfas = [];
        let hasProcessedCfa = false;

        if (
          ApiHandler.appType === AppType.NODE_CONNECT ||
          ApiHandler.appType === AppType.SUPPORTED_RLN
        ) {
          for (let i = 0; i < assets?.cfa.length; i++) {
            const collectible: Collectible = assets.cfa[i];
            const mediaByte = await ApiHandler.api.getassetmedia({
              digest: collectible.media.digest,
            });
            const { base64, fileType } = hexToBase64(mediaByte.bytes_hex);
            const ext = collectible.media.mime.split('/')[1];
            const path = `${RNFS.DocumentDirectoryPath}/${collectible.media.digest}.${ext}`;
            await RNFS.writeFile(path, base64, 'base64');

            cfas.push({
              ...collectible,
              media: {
                ...collectible.media,
                filePath: path,
              },
            });
          }
          hasProcessedCfa = true;
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
          hasProcessedCfa = true;
        }

        if (!hasProcessedCfa) {
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
        if (
          ApiHandler.appType === AppType.NODE_CONNECT ||
          ApiHandler.appType === AppType.SUPPORTED_RLN
        ) {
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

  static parseAssetResponse(response: any) {
    if (!response || typeof response !== 'object') return undefined;
    if (response?.error || response?.code >= 400 || !response?.asset) {
      return response;
    }
    return ApiHandler.appType === AppType.SUPPORTED_RLN
      ? response.asset
      : response;
  }

  static async addAssetToWallet({ asset }: { asset: Asset }) {
    try {
      const coins = dbManager.getCollection(RealmSchema.Coin);
      if (coins.find(coin => coin.assetId === asset.assetId)) {
        return;
      }
      dbManager.createObject(RealmSchema.Coin, {
        ...asset,
        addedAt: Date.now(),
        issuedSupply: asset.issuedSupply.toString(),
        balance: {
          spendable: '0',
          future: '0',
          settled: '0',
          offchainOutbound: '0',
          offchainInbound: '0',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async issueNewCoin({
    name,
    ticker,
    supply,
    precision,
  }: {
    name: string;
    ticker: string;
    supply: string;
    precision: number;
  }) {
    try {
      const assetResponse = await RGBServices.issueAssetNia(
        ticker,
        name,
        `${supply}`,
        precision,
        ApiHandler.appType,
        ApiHandler.api,
      );
      const response = ApiHandler.parseAssetResponse(assetResponse);
      if (response?.assetId) {
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        const metadata = await RGBServices.getRgbAssetMetaData(
          response?.assetId,
          ApiHandler.appType,
          ApiHandler.api,
        );
        await Relay.registerAsset(
          app.id,
          { ...metadata, ...response },
          app.authToken,
        );
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
        await ApiHandler.refreshRgbWallet();
      }
      return response;
    } catch (error) {
      console.log('error', error);
      throw new Error(`${error}`);
    }
  }

  static async issueNewCollectible({
    name,
    description,
    supply,
    filePath,
    precision,
  }: {
    name: string;
    description: string;
    supply: string;
    filePath: string;
    precision: number;
  }) {
    try {
      const assetResponse = await RGBServices.issueAssetCfa(
        name,
        description,
        `${supply}`,
        precision,
        filePath,
        ApiHandler.appType,
        ApiHandler.api,
      );
      const response = ApiHandler.parseAssetResponse(assetResponse);
      if (response?.assetId) {
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        await ApiHandler.refreshRgbWallet();
        const collectible = dbManager.getObjectByPrimaryId(
          RealmSchema.Collectible,
          'assetId',
          response?.assetId,
        ) as unknown as Collectible;
        await Relay.registerAsset(app.id, { ...collectible }, app.authToken);
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
  }: {
    name: string;
    ticker: string;
    details: string;
    mediaFilePath: string;
    attachmentsFilePaths: string[];
  }) {
    try {
      const assetResponse = await RGBServices.issueAssetUda(
        name,
        ticker,
        details,
        mediaFilePath,
        attachmentsFilePaths,
        ApiHandler.appType,
        ApiHandler.api,
      );
      const response = ApiHandler.parseAssetResponse(assetResponse);
      if (response?.assetId) {
        await ApiHandler.refreshRgbWallet();
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        const collectible = dbManager.getObjectByPrimaryId(
          RealmSchema.UniqueDigitalAsset,
          'assetId',
          response?.assetId,
        ) as unknown as Collectible;
        await Relay.registerAsset(app.id, { ...collectible }, app.authToken);
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
      if (
        ApiHandler.appType === AppType.NODE_CONNECT ||
        ApiHandler.appType === AppType.SUPPORTED_RLN
      ) {
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
        response.issuedSupply = response.issuedSupply.toString();
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
      const response = await Relay.updateApp(
        appID,
        appName,
        walletImage,
        ApiHandler.authToken,
      );
      if (response.updated) {
        dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appID, {
          appName: appName,
          walletImage: response.imageUrl,
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async removeWalletPicture(appID: string) {
    try {
      const response = await Relay.removeWalletPicture(
        ApiHandler.authToken,
        appID,
      );
      if (response.success) {
        dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appID, {
          walletImage: null,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async manageFcmVersionTopics(
    previousVersion?: string,
    currentVersion?: string,
  ): Promise<void> {
    try {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);
      const appVersion = currentVersion || DeviceInfo.getVersion();
      const lastTopicVersion =
        previousVersion || Storage.get(Keys.LAST_FCM_VERSION_TOPIC);
      if (!lastTopicVersion || lastTopicVersion !== appVersion) {
        if (lastTopicVersion) {
          await ApiHandler.unsubscribeFromVersionTopic(
            messaging,
            lastTopicVersion,
          );
        }
        await ApiHandler.subscribeToVersionTopic(messaging, appVersion);
        Storage.set(Keys.LAST_FCM_VERSION_TOPIC, appVersion);
      }
      await ApiHandler.subscribeToBroadcastChannel(messaging);
    } catch (error) {
      console.error('FCM topic management error:', error);
      throw error;
    }
  }

  private static async unsubscribeFromVersionTopic(
    messaging: any,
    version: string,
  ): Promise<void> {
    const topic = `v${version}`;
    try {
      await messaging.unsubscribeFromTopic(topic);
    } catch (error) {
      console.warn(`Failed to unsubscribe from ${topic}:`, error);
    }
  }

  private static async subscribeToVersionTopic(
    messaging: any,
    version: string,
  ): Promise<void> {
    const topic = `v${version}`;
    try {
      await messaging.subscribeToTopic(topic);
    } catch (error) {
      console.error(`Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  private static async subscribeToBroadcastChannel(
    messaging: any,
  ): Promise<void> {
    try {
      await messaging.subscribeToTopic(config.TRIBE_FCM_BROADCAST_CHANNEL);
    } catch (error) {
      console.warn('Failed to subscribe to common broadcast topic:', error);
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
      ) as VersionHistory;
      const currentVersion = `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`;
      if (version?.version !== currentVersion) {
        dbManager.createObject(RealmSchema.VersionHistory, {
          version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: githubReleaseNote.releaseNote,
          date: new Date().toString(),
          title: `Upgraded from ${
            version?.version || 'unknown'
          } to ${currentVersion}`,
        });
        await ApiHandler.manageFcmVersionTopics(
          version?.version,
          currentVersion,
        );
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
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
      console.log('fcm update error:', error?.message || error);
      throw error;
    }
  }
  static async viewUtxos() {
    try {
      const response = await RGBServices.getUnspents(
        ApiHandler.appType,
        ApiHandler.api,
      );
      if (!Array.isArray(response)) {
        throw new Error(
          `Expected array but got: ${typeof response} — ${JSON.stringify(
            response,
          )}`,
        );
      }
      const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      const utxosData = response.map(utxo => JSON.stringify(utxo));
      dbManager.updateObjectByPrimaryId(
        RealmSchema.RgbWallet,
        'mnemonic',
        rgbWallet.mnemonic,
        {
          utxos: utxosData,
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
      console.log('viewNodeInfo - error', error);
      throw new Error('Failed to connect to node');
    }
  }

  static async saveNodeMnemonic(
    nodeId: string,
    authToken: string,
  ): Promise<string> {
    try {
      const response = await Relay.saveNodeMnemonic(nodeId, authToken);
      if (response) {
        const { status, mnemonic, peerUrl } = response;
        if (mnemonic) {
          const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
            RealmSchema.RgbWallet,
          );
          if (rgbWallet?.nodeMnemonic !== mnemonic) {
            await dbManager.updateObjectByPrimaryId(
              RealmSchema.RgbWallet,
              'mnemonic',
              rgbWallet.mnemonic,
              { nodeMnemonic: mnemonic },
            );
            await dbManager.updateObjectByPrimaryId(
              RealmSchema.TribeApp,
              'id',
              nodeId,
              { primaryMnemonic: mnemonic },
            );
            await dbManager.updateObjectByPrimaryId(
              RealmSchema.RgbWallet,
              'mnemonic',
              rgbWallet.mnemonic,
              { peerDNS: peerUrl },
            );

            await ApiHandler.createNewWallet({});
          }
        }

        return status;
      } else {
        throw new Error('Failed to fetch node status');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch node status');
    }
  }

  public static checkNodeStatus = async (
    nodeId: string,
    authToken: string,
  ): Promise<string | null> => {
    console.log('nodeId', nodeId);
    console.log('authToken', authToken);
    try {
      const node: any = await Relay.getNodeById(nodeId, authToken);
      const status = node?.nodeInfo?.data?.status || node?.node?.status;
      return status;
    } catch (err) {
      console.error('Error fetching node status:', err);
      return null;
    }
  };

  static async startNode(nodeId, authToken) {
    try {
      const response = await Relay.startNodeById(nodeId, authToken);
      if (response) {
        return response;
      } else {
        throw new Error('Failed to fetching node status');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to fetching node status');
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
          if (createUtxos?.error) {
            throw new Error(createUtxos.error);
          }
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
      console.log('error - ', error);
      console.log('error?.message', error?.message);
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
      let message =
        error?.response?.data?.error || error?.message || 'Unknown error';
      if (!message || message === 'Error') {
        message =
          'Unable to create wallet in supported mode. Please try again later.';
      }
      throw new Error(message);
    }
  }

  static async unlockNode() {
    try {
      const response = await ApiHandler.api.unlock(
        'tribe@2024',
        this.authToken,
      );
      if (response.error) {
        throw new Error(response.error);
      }
      if (response) {
        return response;
      } else {
        throw new Error('Failed to unlock node');
      }
    } catch (error) {
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
            wallet.masterFingerprint,
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
    verified: boolean,
  ): Promise<{ success: boolean; tweet?: any; reason?: string }> => {
    try {
      const response = await fetchAndVerifyTweet(tweetId);

      if (response.status === 429) {
        const resetAfter = response.headers.get('x-rate-limit-reset');
        const now = Math.floor(Date.now() / 1000);
        const waitTime = resetAfter ? Number(resetAfter) - now : null;

        if (waitTime && waitTime > 0) {
          Toast(
            `You've reached the tweet fetch limit. Try again in ${waitTime}s (around ${new Date(
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
        const message =
          errorJson?.title === 'UsageCapExceeded'
            ? 'Twitter API usage cap exceeded. Please try again later.'
            : errorJson?.title ||
              errorJson?.detail ||
              `HTTP error ${response.status}`;
        return { success: false, reason: message };
      }

      const data = await response.json();
      const tweet = data?.data;

      if (!tweet) return { success: false, reason: 'Tweet not found' };
      if (!tweet.text.includes(assetId)) {
        return { success: false, reason: 'Asset ID not found in tweet text' };
      }

      const existingAsset = await dbManager.getObjectByPrimaryId(
        schema,
        'assetId',
        asset.assetId,
      );
      const existingVerifiedBy = existingAsset?.issuer?.verifiedBy || [];
      let updatedVerifiedBy = [...existingVerifiedBy];

      const twitterPostIndex = updatedVerifiedBy.findIndex(
        v => v.type === IssuerVerificationMethod.TWITTER_POST,
      );

      const twitterEntry = existingAsset?.issuer?.verifiedBy?.find(
        v => v.type === IssuerVerificationMethod.TWITTER,
      );

      const twitterPostData = {
        type: IssuerVerificationMethod.TWITTER_POST,
        link: tweetId,
        id: twitterEntry?.id ?? '',
        name: twitterEntry?.name ?? '',
        username: twitterEntry?.username ?? '',
      };

      if (twitterPostIndex !== -1) {
        updatedVerifiedBy[twitterPostIndex] = twitterPostData;
      } else {
        updatedVerifiedBy.push(twitterPostData);
      }
      let isVerified = false;
      if (verified && twitterEntry) {
        const relayResponse = await Relay.verifyIssuer(
          'appID',
          asset.assetId,
          twitterPostData,
        );
        isVerified = relayResponse.status;
      }
      await dbManager.updateObjectByPrimaryId(
        schema,
        'assetId',
        asset.assetId,
        {
          issuer: {
            verified: isVerified,
            verifiedBy: updatedVerifiedBy,
          },
        },
      );

      return { success: true, tweet };
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
      const { coins = [] } = (await Relay.getPresetAssets()) || {};
      coins.forEach((coin: Coin) => {
        const exists = dbManager.getObjectByPrimaryId(
          RealmSchema.Coin,
          'assetId',
          coin.assetId,
        );
        if (exists) {
          dbManager.updateObjectByPrimaryId(
            RealmSchema.Coin,
            'assetId',
            coin.assetId,
            {
              isDefault: coin.isDefault,
              disclaimer: coin.disclaimer,
              iconUrl: coin.iconUrl,
              issuer: coin.issuer,
              assetSource: coin.assetSource,
              campaign: coin.campaign,
              metaData: coin.metaData,
            },
          );
        } else {
          dbManager.createObjectBulk(
            RealmSchema.Coin,
            [coin],
            Realm.UpdateMode.Modified,
          );
        }
      });
    } catch (error) {
      return error;
    }
  };

  static async claimCampaign(campaignId: string, mode: 'WITNESS' | 'BLINDED') {
    try {
      const app: TribeApp = dbManager.getObjectByIndex<TribeApp>(
        RealmSchema.TribeApp,
      ) as TribeApp;

      const isEligible = await Relay.isEligibleForCampaign(
        app.authToken,
        campaignId,
      );
      if (!isEligible.status) {
        return {
          claimed: false,
          error: isEligible.message,
        };
      }
      const isBlinded = mode === 'BLINDED';
      const expiryTime = 60 * 60 * 24 * 3;

      const invoice = await this.tryClaimWithInvoice(
        app,
        campaignId,
        isBlinded,
        expiryTime,
      );
      if (invoice.claimed) return invoice;
      if (invoice.error === 'Insufficient sats for RGB') {
        const utxos = await ApiHandler.createUtxos();
        if (utxos) {
          await this.refreshRgbWallet();
          await Promise.resolve(
            new Promise(resolve => setTimeout(resolve, 1000)),
          );
          const retryInvoice = await this.tryClaimWithInvoice(
            app,
            campaignId,
            isBlinded,
            expiryTime,
          );
          if (retryInvoice.claimed) return retryInvoice;
        }
        return {
          claimed: false,
          error: invoice.error,
        };
      }
      return {
        claimed: false,
        error: invoice.error || invoice.message || 'Failed to generate invoice',
      };
    } catch (error: any) {
      console.error('Claim campaign error:', error.message || error);
      return { claimed: false, error: error.message || error };
    }
  }

  private static async tryClaimWithInvoice(
    app: TribeApp,
    campaignId: string,
    isBlinded: boolean,
    expiryTime: number,
  ) {
    const receiveData = await RGBServices.receiveAsset(
      ApiHandler.appType,
      ApiHandler.api,
      '',
      0,
      expiryTime,
      isBlinded,
    );
    if (receiveData.invoice) {
      const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
        RealmSchema.RgbWallet,
      );
      const invoices = [
        ...rgbWallet?.invoices,
        { ...receiveData, type: InvoiceType.Campaign },
      ];
      dbManager.updateObjectByPrimaryId(
        RealmSchema.RgbWallet,
        'mnemonic',
        rgbWallet.mnemonic,
        { receiveData: receiveData, invoices: invoices },
      );
      const response = await Relay.claimCampaign(
        app.authToken,
        campaignId,
        receiveData.invoice,
      );
      return response;
    }
    return { claimed: false, error: receiveData.error };
  }
}
