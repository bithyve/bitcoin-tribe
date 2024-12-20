import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import bitcoinMessage from 'bitcoinjs-message';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import bip21 from 'bip21';
import bs58check from 'bs58check';
import idx from 'idx';
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
  XpubTypes,
} from '../enums';
import { OutputUTXOs } from '../interfaces';
import { whirlPoolWalletTypes } from '../factories/WalletFactory';
import ecc from './taproot-utils/noble_ecc';
import { Signer, Vault } from '../interfaces/vault';

bitcoinJS.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

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

  static getMasterFingerprintForWallet(wallet: Wallet) {
    return whirlPoolWalletTypes.includes(wallet.type)
      ? wallet.depositWalletId
      : wallet.id;
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
      type === NetworkType.TESTNET || type === NetworkType.REGTEST ? 1 : 0;
    if (entity === EntityKind.VAULT) {
      const scriptNum = scriptType === BIP48ScriptTypes.NATIVE_SEGWIT ? 2 : 1;
      return `m/${DerivationPurpose.BIP48}'/${isTestnet}'/${accountNumber}'/${scriptNum}'`;
    }
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

  static deriveMultiSig = (
    required: number,
    pubkeys: Buffer[],
    network: bitcoinJS.Network,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT,
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment | undefined;
  } => {
    const p2ms = bitcoinJS.payments.p2ms({
      m: required,
      pubkeys,
      network,
    });
    const p2wsh = bitcoinJS.payments.p2wsh({
      redeem: p2ms,
      network,
    });

    let p2sh;
    if (scriptType === BIP48ScriptTypes.WRAPPED_SEGWIT) {
      // wrap native segwit
      p2sh = bitcoinJS.payments.p2sh({
        redeem: p2wsh,
        network,
      });
    }

    return { p2ms, p2wsh, p2sh };
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
    wallet: Wallet | Vault,
  ): {
    publicKey: Buffer;
    subPath: number[];
  } => {
    const { networkType } = wallet;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    let xpub = null;

    if (wallet.entityKind === EntityKind.VAULT) {
      if ((wallet as Vault).isMultiSig) {
        throw new Error('MultiSig should use: addressToMultiSig');
      }
      xpub = (wallet as Vault).specs.xpubs[0]; // xpub for vault(1-of-1)
    } else {
      xpub = (wallet as Wallet).specs.xpub;
    }

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
    wallet: Wallet | Vault,
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

  static createMultiSig = (
    wallet: Vault,
    childIndex: number,
    internal: boolean,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT,
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment;
    pubkeys: Buffer[];
    orderPreservedPubkeys: string[];
    address: string;
    subPath: number[];
    signerPubkeyMap: Map<string, Buffer>;
  } => {
    const subPath = [internal ? 1 : 0, childIndex];
    const signerPubkeyMap = new Map<string, Buffer>();

    let orderPreservedPubkeys: string[] = []; // non-bip-67(original order)
    let pubkeys: Buffer[] = []; // bip-67 ordered

    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { xpubs } = wallet.specs;

    const addressCache: AddressCache = wallet.specs.addresses || {
      external: {},
      internal: {},
    };
    const addressPubs: AddressPubs = wallet.specs.addressPubs || {};

    const correspondingAddress = internal
      ? addressCache.internal[childIndex]
      : addressCache.external[childIndex];

    if (addressPubs[correspondingAddress]) {
      // using cached pubkeys to prepare multisig assets
      const cachedPubs = addressPubs[correspondingAddress].split('/'); // non bip-67 compatible(maintains xpub/signer order)
      orderPreservedPubkeys = cachedPubs;
      xpubs.forEach((xpub, i) => {
        signerPubkeyMap.set(xpub, Buffer.from(cachedPubs[i], 'hex'));
      });
      pubkeys = cachedPubs
        .sort((a, b) => (a > b ? 1 : -1))
        .map(pub => Buffer.from(pub, 'hex')); // bip-67 compatible(cached ones are in hex)
    } else {
      // generating pubkeys to prepare multisig assets
      for (let i = 0; i < xpubs.length; i++) {
        const childExtendedKey = WalletUtilities.generateChildFromExtendedKey(
          xpubs[i],
          network,
          childIndex,
          internal,
        );
        const xKey = bip32.fromBase58(childExtendedKey, network);
        orderPreservedPubkeys[i] = xKey.publicKey.toString('hex');
        pubkeys[i] = xKey.publicKey;
        signerPubkeyMap.set(xpubs[i], pubkeys[i]);
      }
      pubkeys = pubkeys.sort((a, b) =>
        a.toString('hex') > b.toString('hex') ? 1 : -1,
      ); // bip-67 compatible
    }

    const { p2ms, p2wsh, p2sh } = WalletUtilities.deriveMultiSig(
      wallet.scheme.m,
      pubkeys,
      network,
      scriptType,
    );
    const address = p2sh ? p2sh.address : p2wsh.address;

    return {
      p2ms,
      p2wsh,
      p2sh,
      pubkeys,
      orderPreservedPubkeys,
      address,
      subPath,
      signerPubkeyMap,
    };
  };

  static addressToMultiSig = (
    address: string,
    wallet: Vault,
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment;
    pubkeys: Buffer[];
    address: string;
    subPath: number[];
    signerPubkeyMap: Map<string, Buffer>;
  } => {
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    const addressCache: AddressCache = wallet.specs.addresses || {
      external: {},
      internal: {},
    };

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (addressCache.external[itr] === address) {
        const multiSig = WalletUtilities.createMultiSig(wallet, itr, false);
        return multiSig;
      }
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (addressCache.internal[itr] === address) {
        const multiSig = WalletUtilities.createMultiSig(wallet, itr, true);
        return multiSig;
      }
    }

    throw new Error(`Could not find multisig for: ${address}`);
  };

  static getSubPathForAddress = (
    address: string,
    wallet: Wallet | Vault,
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
    } else if (WalletUtilities.isValidRGBAddress(scannedStr)) {
      return {
        type: PaymentInfoKind.RGB_INVOICE,
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
    wallet: Wallet | Vault,
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
    let changeMultisig: {
      p2ms: bitcoinJS.payments.Payment;
      p2wsh: bitcoinJS.payments.Payment;
      p2sh: bitcoinJS.payments.Payment;
      pubkeys: Buffer[];
      address: string;
      subPath: number[];
      signerPubkeyMap: Map<string, Buffer>;
    };
    if ((wallet as Vault).isMultiSig) {
      changeMultisig = WalletUtilities.createMultiSig(
        wallet as Vault,
        nextFreeChangeAddressIndex,
        true,
      );
    }

    let purpose;
    if (wallet.entityKind === EntityKind.WALLET) {
      purpose = WalletUtilities.getPurpose(
        (wallet as Wallet).derivationDetails.xDerivationPath,
      );
    }

    for (const output of outputs) {
      // case: change exists
      if (!output.address) {
        if ((wallet as Vault).isMultiSig) {
          output.address = changeMultisig.address;
          return { outputs, changeMultisig };
        }

        let xpub = null;
        if (wallet.entityKind === EntityKind.VAULT) {
          xpub = (wallet as Vault).specs.xpubs[0];
        } // 1-of-1 multisig
        else {
          xpub = (wallet as Wallet).specs.xpub;
        }

        output.address = WalletUtilities.getAddressByIndex(
          xpub,
          true,
          nextFreeChangeAddressIndex,
          network,
          purpose,
        );
        return { outputs, changeAddress: output.address };
      }
    }

    // case: no change
    if ((wallet as Vault).isMultiSig) {
      return { outputs, changeMultisig };
    } else {
      return { outputs, changeAddress };
    }
  };

  // static generateXpubFromMetaData = (cryptoAccount: CryptoAccount) => {
  //   const version = Buffer.from('02aa7ed3', 'hex');
  //   const hdKey = cryptoAccount.getOutputDescriptors()[0].getCryptoKey() as CryptoHDKey;
  //   const depth = hdKey.getOrigin().getDepth();
  //   const depthBuf = Buffer.alloc(1);
  //   depthBuf.writeUInt8(depth);
  //   const parentFingerprint = hdKey.getParentFingerprint();
  //   const components = hdKey.getOrigin().getComponents();
  //   const lastComponents = components[components.length - 1];
  //   const index = lastComponents.isHardened()
  //     ? lastComponents.getIndex() + 0x80000000
  //     : lastComponents.getIndex();
  //   const indexBuf = Buffer.alloc(4);
  //   indexBuf.writeUInt32BE(index);
  //   const chainCode = hdKey.getChainCode();
  //   const key = hdKey.getKey();
  //   const derivationPath = `m/${hdKey.getOrigin().getPath()}`;
  //   const xPubBuf = Buffer.concat([version, depthBuf, parentFingerprint, indexBuf, chainCode, key]);
  //   const xPub = bs58check.encode(xPubBuf);
  //   const mfp = cryptoAccount.getMasterFingerprint().toString('hex');
  //   return { xPub, derivationPath, mfp };
  // };

  static getSignerPurposeFromPath = (path: string) => {
    const branches = path.split('/');
    const purpose = branches.length > 1 ? branches[1].match(/(\d+)/) : null;
    if (purpose) {
      return purpose[0];
    }
    return null;
  };

  static getDerivationForScriptType = (
    scriptType: ScriptTypes,
    account = 0,
  ) => {
    const testnet = config.NETWORK_TYPE === NetworkType.TESTNET;
    const networkType = testnet ? 1 : 0;
    switch (scriptType) {
      case ScriptTypes.P2WSH: // multisig native segwit
        return `m/48'/${networkType}'/${account}'/2'`; // bip48 m/purpose'/coin_type'/account'/script_type'/change/address_index
      case ScriptTypes.P2WPKH: // singlesig native segwit
        return `m/84'/${networkType}'/${account}'`;
      case ScriptTypes['P2SH-P2WPKH']: // singlesig wrapped segwit
        return `m/49'/${networkType}'/${account}'`;
      case ScriptTypes['P2SH-P2WSH']: // multisig wrapped segwit
        return `m/48'/${networkType}'/${account}'/1'`;
      case ScriptTypes.P2TR: // Taproot
        return `m/86'/${networkType}'/${account}'`;
      default: // multisig wrapped segwit
        return `m/48'/${networkType}'/${account}'/2'`;
    }
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

  static getPubkeyHashFromScript = (address: string, script: Buffer) => {
    if (address.startsWith('tb1') || address.startsWith('bc1')) {
      return script.slice(2);
    }
    if (
      address.startsWith('m') ||
      address.startsWith('n') ||
      address.startsWith('1')
    ) {
      return script.slice(3, 23);
    }
    if (address.startsWith('2') || address.startsWith('3')) {
      return script.slice(2, 22);
    }
  };

  static signBitcoinMessage = (
    message: string,
    privateKey: string,
    network: bitcoinJS.Network,
  ) => {
    const keyPair = ECPair.fromWIF(privateKey, network);
    const signature = bitcoinMessage.sign(
      message,
      keyPair.privateKey,
      keyPair.compressed,
    );
    return signature.toString('base64');
  };

  static getWalletFromAddress = (
    wallets: (Wallet | Vault)[],
    address: string,
  ) => {
    for (const wallet of wallets) {
      const externalAddresses = idx(wallet, _ => _.specs.addresses.external);
      if (
        externalAddresses &&
        Object.values(externalAddresses).includes(address)
      ) {
        return wallet;
      }
    }
    return null;
  };

  static getScriptTypeFromDerivationPath = (
    derivationPath: string,
  ): XpubTypes => {
    const purpose = WalletUtilities.getPurpose(derivationPath);
    switch (purpose) {
      case DerivationPurpose.BIP48:
        return XpubTypes.P2WSH;
      case DerivationPurpose.BIP84:
        return XpubTypes.P2WPKH;
      case DerivationPurpose.BIP86:
        return XpubTypes.P2TR;
      case DerivationPurpose.BIP49:
        return XpubTypes['P2SH-P2WPKH'];
      case DerivationPurpose.BIP44:
        return XpubTypes.P2PKH;
      default:
        return XpubTypes.P2WSH;
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

  static getImportedKeyDetails = (
    input: string,
  ): {
    importedKeyType: ImportedKeyType;
    watchOnly: Boolean;
    purpose: DerivationPurpose;
  } => {
    try {
      // case: mnemonic
      bip39.mnemonicToEntropy(input);
      return {
        importedKeyType: ImportedKeyType.MNEMONIC,
        watchOnly: false,
        purpose: null,
      };
    } catch (err) {
      try {
        // case: extended keys
        bs58check.decode(input);

        // attempt to create an extended key from the input
        if (config.NETWORK === bitcoinJS.networks.bitcoin) {
          // extended public keys (mainnet)
          if (input.startsWith(ImportedKeyType.XPUB)) {
            return {
              importedKeyType: ImportedKeyType.XPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP44,
            };
          }
          if (input.startsWith(ImportedKeyType.YPUB)) {
            return {
              importedKeyType: ImportedKeyType.YPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP49,
            };
          }
          if (input.startsWith(ImportedKeyType.ZPUB)) {
            return {
              importedKeyType: ImportedKeyType.ZPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP84,
            };
          }

          // extended private keys (mainnet)
          if (input.startsWith(ImportedKeyType.XPRV)) {
            return {
              importedKeyType: ImportedKeyType.XPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP44,
            };
          }
          if (input.startsWith(ImportedKeyType.YPRV)) {
            return {
              importedKeyType: ImportedKeyType.YPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP49,
            };
          }
          if (input.startsWith(ImportedKeyType.ZPRV)) {
            return {
              importedKeyType: ImportedKeyType.ZPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP84,
            };
          }
        } else {
          // extended public keys (testnet)
          if (input.startsWith(ImportedKeyType.TPUB)) {
            return {
              importedKeyType: ImportedKeyType.TPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP44,
            };
          }
          if (input.startsWith(ImportedKeyType.UPUB)) {
            return {
              importedKeyType: ImportedKeyType.UPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP49,
            };
          }
          if (input.startsWith(ImportedKeyType.VPUB)) {
            return {
              importedKeyType: ImportedKeyType.VPUB,
              watchOnly: true,
              purpose: DerivationPurpose.BIP84,
            };
          }

          // extended private keys (testnet)
          if (input.startsWith(ImportedKeyType.TPRV)) {
            return {
              importedKeyType: ImportedKeyType.TPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP44,
            };
          }
          if (input.startsWith(ImportedKeyType.UPRV)) {
            return {
              importedKeyType: ImportedKeyType.UPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP49,
            };
          }
          if (input.startsWith(ImportedKeyType.VPRV)) {
            return {
              importedKeyType: ImportedKeyType.VPRV,
              watchOnly: false,
              purpose: DerivationPurpose.BIP84,
            };
          }
        }
      } catch (err) {
        // if neither mnemonic nor extended key, consider it an invalid input
        throw new Error('Invalid Import Key');
      }
    }
  };

  static getNetworkFromPrefix = prefix => {
    switch (prefix) {
      case 'xpub': // 0x0488b21e
      case 'ypub': // 0x049d7cb2
      case 'Ypub': // 0x0295b43f
      case 'zpub': // 0x04b24746
      case 'Zpub': // 0x02aa7ed3
        return NetworkType.MAINNET;
      case 'tpub': // 0x043587cf
      case 'upub': // 0x044a5262
      case 'Upub': // 0x024289ef
      case 'vpub': // 0x045f1cf6
      case 'Vpub': // 0x02575483
        return NetworkType.TESTNET;
      default:
        return null;
    }
  };

  static getInstanceNumberForSigners = (signers: Signer[]) => {
    const instanceNumbers = signers
      .map(signer => signer.extraData?.instanceNumber)
      .filter(Number.isInteger);

    instanceNumbers.sort((a, b) => a - b);
    let instanceNumber = 0;
    for (const num of instanceNumbers) {
      if (num === instanceNumber + 1) {
        instanceNumber++;
      } else {
        break;
      }
    }
    return instanceNumber;
  };

  static getKeyForScheme = (isMultisig, signer, msXpub, ssXpub, amfXpub) => {
    if (amfXpub) {
      return {
        ...amfXpub,
        masterFingerprint: signer.masterFingerprint,
        xfp: this.getFingerprintFromExtendedKey(
          amfXpub.xpub,
          this.getNetworkByType(config.NETWORK_TYPE),
        ),
      };
    }
    if (isMultisig) {
      return {
        ...msXpub,
        masterFingerprint: signer.masterFingerprint,
        xfp: this.getFingerprintFromExtendedKey(
          msXpub.xpub,
          this.getNetworkByType(config.NETWORK_TYPE),
        ),
      };
    } else {
      return {
        ...ssXpub,
        masterFingerprint: signer.masterFingerprint,
        xfp: this.getFingerprintFromExtendedKey(
          ssXpub.xpub,
          this.getNetworkByType(config.NETWORK_TYPE),
        ),
      };
    }
  };
}
