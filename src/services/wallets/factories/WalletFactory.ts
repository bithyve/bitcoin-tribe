import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivationConfig } from '../interfaces/wallet';
import config from 'src/utils/config';
import {
  EntityKind,
  ImportedKeyType,
  NetworkType,
  ScriptTypes,
  VisibilityType,
  WalletType,
} from '../enums';
import {
  Wallet,
  WalletDerivationDetails,
  WalletImportDetails,
  WalletPresentationData,
  WalletSpecs,
} from '../interfaces/wallet';

import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';
import WalletUtilities from '../operations/utils';
import WalletOperations from '../operations';

export const generateWalletSpecsFromMnemonic = (
  mnemonic: string,
  network: bitcoinJS.Network,
  xDerivationPath: string,
) => {
  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath,
  );
  const { xpriv } = extendedKeys;
  const { xpub } = extendedKeys;

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    txNote: {},
    hasNewUpdates: false,
    lastSynched: 0,
    receivingAddress: '',
  };
  return specs;
};

export const generateWalletSpecsFromExtendedKeys = (
  extendedKey: string,
  extendedKeyType: ImportedKeyType,
) => {
  let xpriv: string;
  let xpub: string;

  if (WalletUtilities.isExtendedPrvKey(extendedKeyType)) {
    xpriv = WalletUtilities.getXprivFromExtendedKey(
      extendedKey,
      config.NETWORK,
    );
    xpub = WalletUtilities.getPublicExtendedKeyFromPriv(xpriv);
  } else if (WalletUtilities.isExtendedPubKey(extendedKeyType)) {
    xpub = WalletUtilities.getXpubFromExtendedKey(extendedKey, config.NETWORK);
  } else {
    throw new Error('Invalid key');
  }

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    txNote: {},
    hasNewUpdates: false,
    lastSynched: 0,
    receivingAddress: '',
  };
  return specs;
};

export const generateWallet = async ({
  // creates a wallet against the provided mnemonic at the given derivation path
  type,
  instanceNum, // account number
  walletName,
  walletDescription,
  derivationConfig,
  primaryMnemonic,
  importDetails,
  networkType,
}: {
  type: WalletType;
  instanceNum: number;
  walletName: string;
  walletDescription: string;
  derivationConfig?: DerivationConfig;
  primaryMnemonic?: string;
  importDetails?: WalletImportDetails;
  networkType: NetworkType;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let id: string;
  let derivationDetails: WalletDerivationDetails;
  let specs: WalletSpecs;

  if (type === WalletType.IMPORTED) {
    // case: import wallet via mnemonic
    if (!importDetails) {
      throw new Error('Import details are missing');
    }
    const { importedKey, importedKeyDetails, derivationConfig } = importDetails;

    let mnemonic;
    if (importedKeyDetails.importedKeyType === ImportedKeyType.MNEMONIC) {
      // case: import wallet via mnemonic
      mnemonic = importedKey;
      id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id
      derivationDetails = {
        instanceNum,
        mnemonic,
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromMnemonic(
        mnemonic,
        network,
        derivationDetails.xDerivationPath,
      );
    } else {
      // case: import wallet via extended keys

      derivationDetails = {
        instanceNum, // null
        mnemonic, // null
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromExtendedKeys(
        importedKey,
        importedKeyDetails.importedKeyType,
      );

      id = WalletUtilities.getFingerprintFromExtendedKey(
        specs.xpriv || specs.xpub,
        config.NETWORK,
      ); // case: extended key imported wallets have xfp as their id
    }
  } else {
    // case: adding new wallet
    if (!primaryMnemonic) {
      throw new Error('Primary mnemonic missing');
    }

    derivationDetails = {
      instanceNum,
      mnemonic: primaryMnemonic,
      xDerivationPath: derivationConfig
        ? derivationConfig.path
        : WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            networkType,
            instanceNum,
          ),
    };
    specs = generateWalletSpecsFromMnemonic(
      primaryMnemonic,
      network,
      derivationDetails.xDerivationPath,
    );

    id = WalletUtilities.getFingerprintFromExtendedKey(
      specs.xpub,
      config.NETWORK,
    );
  }

  const defaultShell = 1;
  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };
  const scriptType: ScriptTypes = WalletUtilities.getScriptTypeFromPurpose(
    WalletUtilities.getPurpose(derivationDetails.xDerivationPath),
  );

  const wallet: Wallet = {
    id,
    entityKind: EntityKind.WALLET,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
    scriptType,
  };
  wallet.specs.receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  return wallet;
};

export const generateBIP85Wallet = async ({
  // generates a BIP85 wallet, where primaryMnemonic acts as the BIP85 parent
  type,
  instanceNum,
  walletName,
  walletDescription,
  derivationConfig,
  primaryMnemonic,
  importDetails,
  networkType,
}: {
  type: WalletType;
  instanceNum: number;
  walletName: string;
  walletDescription: string;
  derivationConfig?: DerivationConfig;
  primaryMnemonic?: string;
  importDetails?: WalletImportDetails;
  networkType: NetworkType;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let bip85Config: BIP85Config;
  let id: string;
  let derivationDetails: WalletDerivationDetails;
  let specs: WalletSpecs;

  if (type === WalletType.IMPORTED) {
    // case: import wallet via mnemonic
    if (!importDetails) {
      throw new Error('Import details are missing');
    }
    const { importedKey, importedKeyDetails, derivationConfig } = importDetails;

    let mnemonic;
    if (importedKeyDetails.importedKeyType === ImportedKeyType.MNEMONIC) {
      // case: import wallet via mnemonic
      mnemonic = importedKey;
      id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id
      derivationDetails = {
        instanceNum,
        mnemonic,
        bip85Config,
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromMnemonic(
        mnemonic,
        network,
        derivationDetails.xDerivationPath,
      );
    } else {
      // case: import wallet via extended keys

      derivationDetails = {
        instanceNum, // null
        mnemonic, // null
        bip85Config, // null
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromExtendedKeys(
        importedKey,
        importedKeyDetails.importedKeyType,
      );

      id = WalletUtilities.getFingerprintFromExtendedKey(
        specs.xpriv || specs.xpub,
        config.NETWORK,
      ); // case: extended key imported wallets have xfp as their id
    }
  } else {
    // case: adding new wallet
    if (!primaryMnemonic) {
      throw new Error('Primary mnemonic missing');
    }
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(
      bip85Config.derivationPath,
      primaryMnemonic,
    );

    const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
    id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id

    derivationDetails = {
      instanceNum,
      mnemonic,
      bip85Config,
      xDerivationPath: derivationConfig
        ? derivationConfig.path
        : WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType),
    };
    specs = generateWalletSpecsFromMnemonic(
      mnemonic,
      network,
      derivationDetails.xDerivationPath,
    );
  }

  const defaultShell = 1;
  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };
  const scriptType: ScriptTypes = WalletUtilities.getScriptTypeFromPurpose(
    WalletUtilities.getPurpose(derivationDetails.xDerivationPath),
  );

  const wallet: Wallet = {
    id,
    entityKind: EntityKind.WALLET,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
    scriptType,
  };
  wallet.specs.receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  return wallet;
};
