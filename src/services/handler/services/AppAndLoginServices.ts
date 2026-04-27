import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  WalletType,
} from 'src/services/wallets/enums';
import config, { APP_STAGE } from 'src/utils/config';
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
import BIP85 from 'src/services/wallets/operations/BIP85';
import { RealmSchema } from 'src/storage/enum';
import { Keys, Storage } from 'src/storage';
import Relay from 'src/services/relay';
import RGBServices from 'src/services/rgb/RGBServices';
import {
  NodeInfo,
  RgbNodeConnectParams,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import * as RNFS from '@dr.pogodin/react-native-fs';
import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import { SHA256 } from 'crypto-js';
import ECPairFactory from 'ecpair';
import { Asset as ImageAsset } from 'react-native-image-picker';
import { restoreKeys } from 'orbis1-sdk-rn';
import { NetworkService } from './networkService';
import { AppLifecycleService } from './appLifecycleService';
import { AuthService } from './authService';
import { ApiHandler as RuntimeApiHandler } from '../runtimeApi';
import { restoreAppImage } from './backupService';
import { refreshRgbWallet, fetchPresetAssets } from './RgbWalletServices';
import { viewUtxos } from './WalletServices';

const ECPair = ECPairFactory(ecc);

export async function setupNewApp({
  appName = "Satoshi's Palette",
  pinMethod = PinMethod.DEFAULT,
  passcode = '',
  walletImage = null,
  mnemonic = null,
  appType,
  rgbNodeConnectParams,
  rgbNodeInfo,
  authToken,
  isRestore = false,
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
  isRestore?: boolean;
}) {
  Storage.set(Keys.SETUPAPP, true);
  Storage.set(Keys.PIN_METHOD, pinMethod);
  const hash = hash512(
    pinMethod !== PinMethod.DEFAULT
      ? passcode
      : config.ENC_KEY_STORAGE_IDENTIFIER,
  );

  let AES_KEY: string;
  const existingEncryptedKey = await SecureStore.fetch(hash);
  if (!existingEncryptedKey) {
    AES_KEY = generateEncryptionKey();
    const encryptedKey = encrypt(hash, AES_KEY);
    await SecureStore.store(hash, encryptedKey);
  } else {
    AES_KEY = decrypt(hash, existingEncryptedKey);
  }
  const uint8array = stringToArrayBuffer(AES_KEY);

  const isRealmInit = await dbManager.initializeRealm(uint8array);
  if (!isRealmInit) {
    Storage.set(Keys.SETUPAPP, false);
    throw new Error('Realm initialisation failed');
  }

  try {
    const githubReleaseNote = await NetworkService.fetchGithubRelease();
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
        appName,
        appID,
        publicId,
        publicKey,
        AppType.ON_CHAIN,
        config.NETWORK_TYPE,
        '',
        signature,
        walletImage,
      );
      if (!registerApp?.app?.authToken) {
        throw new Error('Failed to generate auth token');
      }
      const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
      const newAPP: TribeApp = {
        id: appID,
        publicId,
        appName,
        walletImage: !isRestore ? registerApp?.app?.imageUrl : walletImage || '',
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
        await createNewWallet({});
        const keys = await restoreKeys(
          NetworkService.getBitcoinNetwork(),
          primaryMnemonic,
        );
        const rgbWallet: RGBWallet = {
          mnemonic: primaryMnemonic,
          xpub: keys.xpub,
          rgbDir: '',
          accountXpubColored: keys.accountXpubColored,
          masterFingerprint: keys.masterFingerprint,
          accountXpubVanilla: keys.accountXpubVanilla,
          nodeUrl: '',
          nodeAuthentication: '',
          peerDNS: '',
        } as RGBWallet;
        dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
        await RGBServices.initiate(
          rgbWallet.mnemonic,
          rgbWallet.xpub,
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
        await AppLifecycleService.manageFcmVersionTopics();
        new RuntimeApiHandler(rgbWallet, AppType.ON_CHAIN, registerApp?.app?.authToken);
      }
    } else if (
      appType === AppType.SUPPORTED_RLN ||
      appType === AppType.NODE_CONNECT
    ) {
      const rgbWallet: RGBWallet = {
        mnemonic: rgbNodeConnectParams.mnemonic || rgbNodeConnectParams.nodeId,
        xpub: rgbNodeConnectParams.nodeId,
        rgbDir: '',
        accountXpubColored: rgbNodeConnectParams.nodeId,
        masterFingerprint: rgbNodeConnectParams.nodeId,
        accountXpubVanilla: rgbNodeConnectParams.nodeId,
        nodeUrl: rgbNodeConnectParams.nodeUrl,
        nodeAuthentication: rgbNodeConnectParams.authentication,
        peerDNS: rgbNodeConnectParams?.peerDNS,
      } as RGBWallet;
      new RuntimeApiHandler(
        rgbWallet,
        appType === AppType.SUPPORTED_RLN ? AppType.SUPPORTED_RLN : AppType.NODE_CONNECT,
        authToken,
      );
      const newAPP: TribeApp = {
        id: rgbNodeConnectParams.nodeId,
        publicId: rgbNodeConnectParams.nodeId,
        appName,
        walletImage: '',
        primaryMnemonic: rgbNodeConnectParams.mnemonic || rgbNodeConnectParams.nodeId,
        primarySeed: rgbNodeConnectParams.nodeId,
        imageEncryptionKey: '',
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
        enableAnalytics: true,
        appType: appType === AppType.SUPPORTED_RLN ? AppType.SUPPORTED_RLN : AppType.NODE_CONNECT,
        nodeUrl: rgbNodeConnectParams.nodeUrl,
        nodeAuthentication: rgbNodeConnectParams.authentication,
        authToken,
      } as TribeApp;

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
        await AppLifecycleService.manageFcmVersionTopics();
      }
    } else {
      const privateKeyHex = SHA256(rgbNodeInfo.pubkey).toString();
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      const keyPair = ECPair.fromPrivateKey(privateKey);
      const publicKey = keyPair.publicKey.toString('hex');
      const challenge = await Relay.getChallenge(rgbNodeInfo.pubkey, publicKey);
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
      if (!rgbNodeConnectParams.nodeId) {
        throw new Error('Missing nodeId');
      }
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
        nodeUrl: rgbNodeConnectParams.nodeUrl,
        nodeAuthentication: rgbNodeConnectParams.authentication,
        authToken: registerApp?.app?.authToken,
      } as TribeApp;
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
        } as RGBWallet;
        new RuntimeApiHandler(rgbWallet, appType, registerApp?.app?.authToken);
        dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
        Storage.set(Keys.APPID, rgbNodeInfo.pubkey);
        dbManager.createObject(RealmSchema.VersionHistory, {
          version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: githubReleaseNote.releaseNote,
          date: new Date().toString(),
          title: `Initially installed ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
        });
        await AppLifecycleService.manageFcmVersionTopics();
      }
    }
    Storage.set(Keys.SETUPAPP, false);
  } catch (error) {
    Storage.set(Keys.SETUPAPP, false);
    console.log(error);
    throw error;
  }
}

export async function restoreWithBackupFile({
  mnemonic,
  filePath,
}: {
  mnemonic: string;
  filePath: string;
}) {
  const restore = await RGBServices.restore(mnemonic, filePath);
  if (restore.error) {
    throw new Error(restore.error);
  }
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const publicId = WalletUtilities.getFingerprintFromSeed(seed);
  let data;
  let isRestore = false;
  try {
    const res = await Relay.getAppImage(publicId.toLowerCase());
    if (res.status) {
      data = res.app;
      isRestore = true;
    }
  } catch (error) {
    console.log('GetAppImage error:', error);
  }
  await setupNewApp({
    appName: data?.name || '',
    appType: AppType.ON_CHAIN,
    pinMethod: PinMethod.DEFAULT,
    passcode: '',
    walletImage: data?.imageUrl || '',
    mnemonic,
    isRestore,
  } as any);
  dbManager.updateObjectByPrimaryId(
    RealmSchema.VersionHistory,
    'version',
    `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
    {
      title: `Restored ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
    },
  );
  await restoreAppImage({
    mnemonic,
    settingsObject: data?.settingsObject,
    roomsObject: data?.roomsObject,
    tnxMetaObject: data?.tnxMetaObject,
    invoicesObject: data?.invoicesObject,
  });
}

export async function restoreApp(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const publicId = WalletUtilities.getFingerprintFromSeed(seed);
  const appID = crypto.createHash('sha256').update(publicId).digest('hex');
  const backup = await Relay.getBackup(publicId.toLowerCase());
  if (backup.node) {
    return setupNewApp({
      appName: backup?.app?.name || '',
      appType: AppType.SUPPORTED_RLN,
      pinMethod: PinMethod.DEFAULT,
      passcode: '',
      walletImage: backup?.app?.imageUrl || '',
      rgbNodeConnectParams: {
        authentication: backup.token,
        nodeUrl: backup.apiUrl,
        mnemonic: backup.node.mnemonic,
        nodeId: backup.node.nodeId,
        peerDNS: backup.peerDNS,
      },
      mnemonic: backup.node.mnemonic,
      rgbNodeInfo: backup.nodeInfo,
    } as any);
  }
  if (!backup.file) {
    throw new Error(backup.error);
  }

  const path = `${RNFS.TemporaryDirectoryPath}/${appID}.rgb_backup`;
  await downloadFile({ fromUrl: backup.file, toFile: path } as RNFS.DownloadFileOptionsT);
  await RGBServices.restore(mnemonic, path);
  await setupNewApp({
    appName: backup?.app?.name || '',
    appType: AppType.ON_CHAIN,
    pinMethod: PinMethod.DEFAULT,
    passcode: '',
    walletImage: backup?.app?.imageUrl || '',
    mnemonic,
    isRestore: true,
  } as any);
  const { status, error } = await makeWalletOnline();
  if (!status) {
    throw new Error(error);
  }
  await refreshRgbWallet();
  await fetchPresetAssets();
  await viewUtxos();
  dbManager.updateObjectByPrimaryId(
    RealmSchema.VersionHistory,
    'version',
    `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
    {
      title: `Restored ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
    },
  );
  await restoreAppImage({
    mnemonic,
    settingsObject: backup.app?.settingsObject,
    roomsObject: backup.app?.roomsObject,
    tnxMetaObject: backup.app?.tnxMetaObject,
    invoicesObject: backup.app?.invoicesObject,
  });
}

export async function downloadFile({ ...obj }: RNFS.DownloadFileOptionsT) {
  const { promise } = RNFS.downloadFile({
    progressDivider: 100,
    progressInterval: 5000,
    ...obj,
  });
  return promise;
}

export async function biometricLogin(signature: string) {
  const appId = await Storage.get(Keys.APPID);
  const res = await SecureStore.verifyBiometricAuth(signature, appId as string);
  if (!res.success) {
    throw new Error('Biometric Auth Failed');
  }
  const hash = res.hash;
  const encryptedKey = res.encryptedKey;
  const key = decrypt(hash, encryptedKey);
  const uint8array = stringToArrayBuffer(key);
  await dbManager.initializeRealm(uint8array);
  const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
  const rgbWallet = (await dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  )) as RGBWallet;
  new RuntimeApiHandler(rgbWallet, app.appType, app.authToken);
  if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
    config.NETWORK_TYPE = app.networkType;
  }
  return { key, isWalletOnline: false };
}

export async function createPin(pin: string) {
  return AuthService.createPin(pin);
}

export async function changePin({ key, pin = '' }) {
  return AuthService.changePin({ key, pin });
}

export async function loginWithPin(pin: string) {
  try {
    const hash = hash512(pin);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const uint8array = stringToArrayBuffer(key);
    await dbManager.initializeRealm(uint8array);
    const rgbWallet = (await dbManager.getObjectByIndex(
      RealmSchema.RgbWallet,
    )) as RGBWallet;
    const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
    new RuntimeApiHandler(rgbWallet, app.appType, app.authToken);
    if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
      config.NETWORK_TYPE = app.networkType;
    }
    return { key, isWalletOnline: false };
  } catch (error) {
    throw new Error('Invalid PIN');
  }
}

export async function verifyPin(pin: string) {
  return AuthService.verifyPin(pin);
}

export async function login() {
  const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
  const key = decrypt(hash, await SecureStore.fetch(hash));
  const uint8array = stringToArrayBuffer(key);
  await dbManager.initializeRealm(uint8array);
  const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
  const rgbWallet = (await dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  )) as RGBWallet;
  new RuntimeApiHandler(rgbWallet, app.appType, app.authToken);
  if (config.ENVIRONMENT !== APP_STAGE.PRODUCTION) {
    config.NETWORK_TYPE = app.networkType;
  }
  return { key, isWalletOnline: false };
}

export async function makeWalletOnline(timeout: number = 30): Promise<{
  status: boolean;
  error: string;
}> {
  try {
    const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
    const rgbWallet = (await dbManager.getObjectByIndex(
      RealmSchema.RgbWallet,
    )) as RGBWallet;
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      const api = new RLNNodeApiServices({
        baseUrl: rgbWallet.nodeUrl,
        apiKey: rgbWallet.nodeAuthentication,
      });
      const nodeInfo = await api.nodeinfo();
      if (nodeInfo.pubkey) {
        return {
          status: true,
          error: '',
        };
      }
      return {
        status: false,
        error: 'Node not found',
      };
    }
    return RGBServices.initiate(
      rgbWallet.mnemonic,
      rgbWallet.xpub,
      rgbWallet.accountXpubVanilla,
      rgbWallet.accountXpubColored,
      rgbWallet.masterFingerprint,
    );
  } catch (error) {
    console.log(error);
    return {
      status: false,
      error: `${error}`,
    };
  }
}

export async function createNewWallet({
  instanceNum = 0,
  walletName = 'Default Wallet',
  walletDescription = 'Default Tribe Wallet',
}) {
  try {
    const { primaryMnemonic } = dbManager.getObjectByIndex(
      RealmSchema.TribeApp,
    ) as any;
    const purpose = DerivationPurpose.BIP86;
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
    }
    throw new Error('Failed to create wallet');
  } catch (err) {
    console.log({ err });
  }
}

export async function checkRgbNodeConnection(params: RgbNodeConnectParams) {
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

export async function createSupportedNode() {
  try {
    const response = await Relay.createSupportedNode();
    if (response.error) {
      throw new Error(response.error);
    } else if (response) {
      return response;
    } else {
      throw new Error('Failed to create node');
    }
  } catch (error: any) {
    let message =
      error?.response?.data?.error || error?.message || 'Unknown error';
    if (!message || message === 'Error') {
      message =
        'Unable to create wallet in supported mode. Please try again later.';
    }
    throw new Error(message);
  }
}

export async function resetApp(key: string) {
  return AuthService.resetApp(key);
}