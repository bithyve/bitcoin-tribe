import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import bip21 from 'bip21';
import bs58check from 'bs58check';
import config from 'src/utils/config';
import BIP32Factory, { BIP32Interface } from 'bip32';
import { AddressCache, AddressPubs, Wallet } from '../interfaces/wallet';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  ImportedKeyType,
  NetworkType,
  PaymentInfoKind,
  ScriptTypes,
} from '../enums';
import { OutputUTXOs } from '../interfaces';
import ecc from './taproot-utils/noble_ecc';

bitcoinJS.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);

export default class WalletUtilities {
  static networkType = (scannedStr: string): NetworkType => {
    scannedStr = scannedStr.replace('BITCOIN', 'bitcoin');
    let address = scannedStr;
    if (scannedStr.slice(0, 8) === 'bitcoin:') {
      address = bip21.decode(scannedStr).address;
    }
    try {
      bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.bitcoin);
      return NetworkType.MAINNET;
    } catch (err) {
      try {
        bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.regtest);
        return NetworkType.TESTNET;
      } catch (err) {
        return null;
      }
    }
  };

  static getNetworkByType = (type: NetworkType) => {
    if (type === NetworkType.MAINNET) {
      return bitcoinJS.networks.bitcoin;
    } else if (type === NetworkType.REGTEST) {
      return bitcoinJS.networks.regtest;
    } else if (type === NetworkType.TESTNET4) {
      return bitcoinJS.networks.testnet;
    }
    return bitcoinJS.networks.testnet;
  };

  static getFingerprintFromNode = node => {
    let fingerprintHex = node.fingerprint.toString('hex');
    while (fingerprintHex.length < 8) {
      fingerprintHex = `0${fingerprintHex}`;
    }
    return fingerprintHex.toUpperCase();
  };

  static getFingerprintFromSeed = (seed: Buffer) => {
    const root = bip32.fromSeed(seed);
    return WalletUtilities.getFingerprintFromNode(root);
  };

  static getMasterFingerprintFromMnemonic(
    mnemonic: string,
    passphrase?: string,
  ) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    return WalletUtilities.getFingerprintFromSeed(seed);
  }

  static getFingerprintFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.networks.Network,
  ) => {
    const node = bip32.fromBase58(extendedKey, network);
    return WalletUtilities.getFingerprintFromNode(node);
  };

  static getDerivationPath = (
    entity: EntityKind,
    type: NetworkType,
    accountNumber: number = 0,
    purpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT,
  ): string => {
    const isTestnet =
      type === NetworkType.TESTNET || type === NetworkType.REGTEST || type === NetworkType.TESTNET4 ? 1 : 0;
    return `m/${purpose}'/${isTestnet}'/${accountNumber}'`;
  };

  static getPurpose = (derivationPath: string): DerivationPurpose => {
    const purpose = parseInt(derivationPath.split('/')[1], 10);
    switch (purpose) {
      case DerivationPurpose.BIP86:
        return DerivationPurpose.BIP86;

      case DerivationPurpose.BIP84:
        return DerivationPurpose.BIP84;

      case DerivationPurpose.BIP49:
        return DerivationPurpose.BIP49;

      case DerivationPurpose.BIP48:
        return DerivationPurpose.BIP48;

      case DerivationPurpose.BIP44:
        return DerivationPurpose.BIP44;

      default:
        throw new Error(`Unsupported derivation type, purpose: ${purpose}`);
    }
  };

  static getVersionBytesFromPurpose = (
    purpose: DerivationPurpose,
    network: bitcoinJS.networks.Network,
  ) => {
    switch (purpose) {
      case DerivationPurpose.BIP84:
      case DerivationPurpose.BIP86:
        return network === bitcoinJS.networks.bitcoin ? '04b24746' : '045f1cf6'; // zpub/vpub

      case DerivationPurpose.BIP49:
        return network === bitcoinJS.networks.bitcoin ? '049d7cb2' : '044a5262'; // ypub/upub

      case DerivationPurpose.BIP44:
        return network === bitcoinJS.networks.bitcoin ? '0488b21e' : '043587cf'; // xpub/tpub

      default:
        throw new Error(`Unsupported derivation type, purpose: ${purpose}`);
    }
  };

  static toXOnly = pubKey =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

  static deriveAddressFromKeyPair = (
    keyPair: ECPairInterface | BIP32Interface,
    network: bitcoinJS.Network,
    purpose: DerivationPurpose = DerivationPurpose.BIP84,
  ): string => {
    if (purpose === DerivationPurpose.BIP86) {
      return bitcoinJS.payments.p2tr({
        internalPubkey: WalletUtilities.toXOnly(keyPair.publicKey),
        network,
      }).address;
    }
    if (purpose === DerivationPurpose.BIP84) {
      return bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    }
    if (purpose === DerivationPurpose.BIP49) {
      return bitcoinJS.payments.p2sh({
        redeem: bitcoinJS.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        }),
        network,
      }).address;
    }
    if (purpose === DerivationPurpose.BIP44) {
      return bitcoinJS.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    }

    throw new Error("Unsupported derivation purpose, can't derive address");
  };

  static isValidAddress = (
    address: string,
    network: bitcoinJS.Network,
  ): boolean => {
    try {
      bitcoinJS.address.toOutputScript(address, network);
      return true;
    } catch (err) {
      return false;
    }
  };
  static isValidRGBAddress = scannedStr => {
    // Match for utxo
    const utxoMatch = scannedStr.match(/~\/~\/([^?]+)\?/);
    const utxo = utxoMatch ? utxoMatch[1] : null;
    // Match for endpoint
    const endpointMatch = scannedStr.match(/endpoints=([^&]+)/);
    const endpoint = endpointMatch ? endpointMatch[1] : null;
    if (utxo && endpoint) {
      return true;
    } else {
      return false;
    }
  };

  static validateRgbUrLFormat = scannedStr => {
    const rgbUriRegex =
      /^rgb:[A-Za-z0-9$!@#%^&*-]+\/[0-9]+\/bcrt:utxob:[A-Za-z0-9$!@#%^&*-]+\?expiry=[0-9]+&endpoints=rpc:\/\/[A-Za-z0-9.-]+:[0-9]+\/[A-Za-z-]+$/;
    // Validate the string against the regex
    return rgbUriRegex.test(scannedStr);
  };

  static getKeyPairByIndex = (
    xpriv: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network,
  ): BIP32Interface => {
    const node = bip32.fromBase58(xpriv, network);
    const chain = internal ? 1 : 0;
    const keyPair: BIP32Interface = node.derive(chain).derive(index);
    return keyPair;
  };

  static getPublicKeyByIndex = (
    xpub: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network,
  ): { publicKey: Buffer; subPath: number[] } => {
    const node = bip32.fromBase58(xpub, network);
    const chain = internal ? 1 : 0;
    const keyPair = node.derive(chain).derive(index);
    const { publicKey } = keyPair;
    return { publicKey, subPath: [chain, index] };
  };

  static getAddressByIndex = (
    xpub: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network,
    purpose?: DerivationPurpose,
  ): string => {
    const node = bip32.fromBase58(xpub, network);
    const keyPair = node.derive(internal ? 1 : 0).derive(index);
    return WalletUtilities.deriveAddressFromKeyPair(keyPair, network, purpose);
  };

  static getAddressAndPubByIndex = (
    xpub: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network,
    purpose?: DerivationPurpose,
  ): { address: string; pub: string } => {
    const node = bip32.fromBase58(xpub, network);
    const keyPair = node.derive(internal ? 1 : 0).derive(index);
    return {
      address: WalletUtilities.deriveAddressFromKeyPair(
        keyPair,
        network,
        purpose,
      ),
      pub: keyPair.publicKey.toString('hex'),
    };
  };

  static getP2SH = (
    keyPair: BIP32Interface,
    network: bitcoinJS.Network,
  ): bitcoinJS.Payment =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }),
      network,
    });

  static generateExtendedKey = (
    mnemonic: string,
    privateKey: boolean,
    network: bitcoinJS.networks.Network,
    derivationPath: string,
    passphrase?: string,
  ) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    const root = bip32.fromSeed(seed, network);
    const child = privateKey
      ? root.derivePath(derivationPath)
      : root.derivePath(derivationPath).neutered();
    const xKey = child.toBase58();
    return xKey;
  };

  static generateExtendedKeyPairFromSeed = (
    seed: string,
    network: bitcoinJS.networks.Network,
    derivationPath: string,
  ) => {
    const root = bip32.fromSeed(Buffer.from(seed, 'hex'), network);
    const raw_xPriv = root.derivePath(derivationPath);
    const raw_xPub = raw_xPriv.neutered();

    const xpriv = raw_xPriv.toBase58();
    const xpub = raw_xPub.toBase58();
    return {
      xpriv,
      xpub,
    };
  };

  static generateChildFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.networks.Network,
    childIndex: number,
    internal: boolean,
    shouldNotDerive?: boolean,
  ) => {
    const xKey = bip32.fromBase58(extendedKey, network);
    let childXKey;
    if (shouldNotDerive) {
      childXKey = xKey.derive(childIndex);
    } else {
      childXKey = xKey.derive(internal ? 1 : 0).derive(childIndex);
    }
    return childXKey.toBase58();
  };

  static getPublicExtendedKeyFromPriv = (extendedKey: string): string => {
    const xKey = bip32.fromBase58(extendedKey, config.NETWORK);
    return xKey.neutered().toBase58();
  };

  static getNetworkFromXpub = (xpub: string) => {
    if (xpub) {
      return xpub.startsWith('xpub') ||
        xpub.startsWith('ypub') ||
        xpub.startsWith('zpub')
        ? NetworkType.MAINNET
        : NetworkType.TESTNET;
    }
  };

  static generateYpub = (xpub: string, network: bitcoinJS.Network): string => {
    // generates ypub corresponding to supplied xpub || upub corresponding to tpub
    let data = bs58check.decode(xpub);
    const versionBytes =
      bitcoinJS.networks.bitcoin === network ? '049d7cb2' : '044a5262';
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static getXprivFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.Network,
  ) => {
    // case: xprv corresponding to supplied yprv/zprv  or tprv corresponding to supplied uprv/vprv
    let data = bs58check.decode(extendedKey);
    const versionBytes =
      bitcoinJS.networks.bitcoin === network ? '0488ade4' : '04358394';
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static getXpubFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.Network,
  ) => {
    // case: xpub corresponding to supplied ypub/zpub  or tpub corresponding to supplied upub/vpub
    let data = bs58check.decode(extendedKey);
    const versionBytes =
      bitcoinJS.networks.bitcoin === network ? '0488b21e' : '043587cf';
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static getExtendedPubKeyFromXpub = (
    xpub: string,
    purpose: DerivationPurpose,
    network: bitcoinJS.Network,
  ) => {
    // case: extended pub corresponding to supplied xpub(based on purpose)
    let data = bs58check.decode(xpub);
    const versionBytes = WalletUtilities.getVersionBytesFromPurpose(
      purpose,
      network,
    );
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static getExtendedPubKeyFromWallet = (wallet: Wallet) => {
    const purpose = WalletUtilities.getPurpose(
      (wallet as Wallet).derivationDetails.xDerivationPath, // exists even for imported wallet
    );

    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    return WalletUtilities.getExtendedPubKeyFromXpub(
      wallet.specs.xpub,
      purpose,
      network,
    );
  };

  static addressToPublicKey = (
    address: string,
    wallet: Wallet,
  ): {
    publicKey: Buffer;
    subPath: number[];
  } => {
    const { networkType } = wallet;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    let xpub = null;

    xpub = (wallet as Wallet).specs.xpub;

    const network = WalletUtilities.getNetworkByType(networkType);
    const addressCache: AddressCache = wallet.specs.addresses || {
      external: {},
      internal: {},
    };
    const addressPubs: AddressPubs = wallet.specs.addressPubs || {};

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (addressCache.external[itr] === address) {
        if (addressPubs[address]) {
          return {
            publicKey: Buffer.from(addressPubs[address], 'hex'),
            subPath: [0, itr],
          };
        } else {
          return WalletUtilities.getPublicKeyByIndex(xpub, false, itr, network);
        }
      }
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (addressCache.internal[itr] === address) {
        if (addressPubs[address]) {
          return {
            publicKey: Buffer.from(addressPubs[address], 'hex'),
            subPath: [1, itr],
          };
        } else {
          return WalletUtilities.getPublicKeyByIndex(xpub, true, itr, network);
        }
      }
    }

    throw new Error(`Could not find public key for: ${address}`);
  };

  static addressToKeyPair = (
    address: string,
    wallet: Wallet,
  ): {
    keyPair: BIP32Interface;
  } => {
    const { networkType } = wallet;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    let xpriv = (wallet as Wallet).specs.xpriv;

    const network = WalletUtilities.getNetworkByType(networkType);
    const addressCache: AddressCache = wallet.specs.addresses || {
      external: {},
      internal: {},
    };

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (addressCache.external[itr] === address) {
        return {
          keyPair: WalletUtilities.getKeyPairByIndex(
            xpriv,
            false,
            itr,
            network,
          ),
        };
      }
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (addressCache.internal[itr] === address) {
        return {
          keyPair: WalletUtilities.getKeyPairByIndex(xpriv, true, itr, network),
        };
      }
    }

    throw new Error(`Could not find public key for: ${address}`);
  };

  static getSubPathForAddress = (
    address: string,
    wallet: Wallet,
  ): {
    subPath: number[];
  } => {
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    const addressCache: AddressCache = wallet.specs.addresses || {
      external: {},
      internal: {},
    };

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (addressCache.external[itr] === address) {
        return { subPath: [0, itr] };
      }
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (addressCache.internal[itr] === address) {
        return { subPath: [1, itr] };
      }
    }

    throw new Error(`Could not find subpath for multisig: ${address}`);
  };

  static generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string },
  ): { paymentURI: string } => {
    if (options) {
      return {
        paymentURI: bip21.encode(address, options),
      };
    }
    return {
      paymentURI: bip21.encode(address),
    };
  };

  static decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => bip21.decode(paymentURI);

  static isPaymentURI = (paymentURI: string): boolean =>
    paymentURI.slice(0, 8) === 'bitcoin:';

  static addressDiff = (scannedStr: string, network: bitcoinJS.Network) => {
    scannedStr = scannedStr.replace('BITCOIN', 'bitcoin');
    if (WalletUtilities.isPaymentURI(scannedStr)) {
      const { address, options } = WalletUtilities.decodePaymentURI(scannedStr);
      if (WalletUtilities.isValidAddress(address, network)) {
        return {
          type: PaymentInfoKind.PAYMENT_URI,
          address: address,
          amount: options.amount,
          message: options.message,
        };
      }
    } else if (WalletUtilities.isValidAddress(scannedStr, network)) {
      return {
        type: PaymentInfoKind.ADDRESS,
        address: scannedStr,
      };
    } else if (scannedStr.startsWith('lnbc')) {
      return {
        type: PaymentInfoKind.RLN_INVOICE,
        address: scannedStr,
      };
    }
    return {
      type: null,
    };
  };

  static generateChange = (
    wallet: Wallet,
    outputs: Array<OutputUTXOs>,
    nextFreeChangeAddressIndex: number,
    network: bitcoinJS.networks.Network,
  ):
    | {
        outputs: OutputUTXOs[];
        changeMultisig: {
          p2ms: bitcoinJS.payments.Payment;
          p2wsh: bitcoinJS.payments.Payment;
          p2sh: bitcoinJS.payments.Payment;
          pubkeys: Buffer[];
          address: string;
          subPath: number[];
          signerPubkeyMap: Map<string, Buffer>;
        };
        changeAddress?: string;
      }
    | {
        outputs: OutputUTXOs[];
        changeAddress: string;
        changeMultisig?: any;
      } => {
    const changeAddress: string = '';

    let purpose;
    if (wallet.entityKind === EntityKind.WALLET) {
      purpose = WalletUtilities.getPurpose(
        (wallet as Wallet).derivationDetails.xDerivationPath,
      );
    }

    for (const output of outputs) {
      // case: change exists
      if (!output.address) {
        let xpub = null;
        xpub = (wallet as Wallet).specs.xpub;

        output.address = WalletUtilities.getAddressByIndex(
          xpub,
          false,
          nextFreeChangeAddressIndex,
          network,
          purpose,
        );
        return { outputs, changeAddress: output.address };
      }
    }

    // case: no change
    return { outputs, changeAddress };
  };

  static getScriptTypeFromPurpose = (purpose: DerivationPurpose) => {
    switch (purpose) {
      case DerivationPurpose.BIP86:
        return ScriptTypes.P2TR;
      case DerivationPurpose.BIP84:
        return ScriptTypes.P2WPKH;
      case DerivationPurpose.BIP49:
        return ScriptTypes['P2SH-P2WPKH'];
      case DerivationPurpose.BIP48:
        return ScriptTypes.P2WSH;
      case DerivationPurpose.BIP44:
        return ScriptTypes.P2PKH;
      default:
        throw new Error(`Purpose:${purpose} not supported`);
    }
  };

  static isExtendedPrvKey = (keyType: ImportedKeyType) => {
    if (config.NETWORK === bitcoinJS.networks.bitcoin) {
      return [
        ImportedKeyType.XPRV,
        ImportedKeyType.YPRV,
        ImportedKeyType.ZPRV,
      ].includes(keyType);
    } else {
      return [
        ImportedKeyType.TPRV,
        ImportedKeyType.UPRV,
        ImportedKeyType.VPRV,
      ].includes(keyType);
    }
  };

  static isExtendedPubKey = (keyType: ImportedKeyType) => {
    if (config.NETWORK === bitcoinJS.networks.bitcoin) {
      return [
        ImportedKeyType.XPUB,
        ImportedKeyType.YPUB,
        ImportedKeyType.ZPUB,
      ].includes(keyType);
    } else {
      return [
        ImportedKeyType.TPUB,
        ImportedKeyType.UPUB,
        ImportedKeyType.VPUB,
      ].includes(keyType);
    }
  };
}
