export enum DerivationPurpose {
  BIP44 = 44, // P2PKH: legacy, single-sig
  BIP48 = 48, // P2WSH & P2SH-P2WSH: native and wrapped segwit, multi-sig
  BIP49 = 49, // P2SH-P2WPKH: wrapped segwit, single-sg
  BIP84 = 84, // P2WPKH: native segwit, single-sig
  BIP86 = 86, // P2TR: taproot
}

export enum BIP48ScriptTypes {
  WRAPPED_SEGWIT = 'WRAPPED_SEGWIT',
  NATIVE_SEGWIT = 'NATIVE_SEGWIT',
}

export enum BIP85Languages {
  ENGLISH = 'english',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  SPANISH = 'spanish',
  CHINESE_SIMPLIFIED = 'chinese_simplified',
  CHINESE_TRADITIONAL = 'chinese_traditional',
  FRENCH = 'french',
  ITALIAN = 'italian',
  CZECH = 'czech',
}

export enum BIP85Words {
  TWELVE = 12,
  TWENTY_FOUR = 24,
}

export enum TransactionType {
  RECEIVED = 'Received',
  SENT = 'Sent',
}

export enum TransactionKind {
  SERVICE_FEE = 'Service fee',
  CREATE_UTXOS = 'Create UTXOs',
}

export enum RGBTransactionType {
  RECEIVE = 'RECEIVE',
  SEND = 'SEND',
  ISSUANCE = 'ISSUANCE',
}

export enum TxPriorityDefault {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom',
}

export enum TxPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom',
}

export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
  REGTEST = 'REGTEST',
}

export enum NodeType {
  ONCHAIN = 'ONCHAIN',
  LIGHTNING = 'LIGHTNING',
}

export enum VisibilityType {
  DEFAULT = 'DEFAULT',
  // DURESS = 'DURESS',
  HIDDEN = 'HIDDEN',
  // ARCHIVED = 'ARCHIVED',
}

export enum EntityKind {
  WALLET = 'WALLET',
}

export enum WalletType {
  DEFAULT = 'DEFAULT',
  IMPORTED = 'IMPORTED',
}

export enum PaymentInfoKind {
  ADDRESS = 'address',
  PAYMENT_URI = 'paymentURI',
  RGB_INVOICE = 'rgbInvoice',
  RLN_INVOICE = 'rlninvoice',
  RGB_INVOICE_URL = 'rgbInvoiceUrl',
}

export enum ScriptTypes {
  'P2PKH' = 'P2PKH', // legacy
  'P2SH-P2WSH' = 'P2SH-P2WSH', // multisig wrapped segwit
  'P2WSH' = 'P2WSH', // multisig native segwit
  'P2SH-P2WPKH' = 'P2SH-P2WPKH', // singlesig wrapped segwit
  'P2WPKH' = 'P2WPKH', // singlesig native segwit
  'P2TR' = 'P2TR', // Taproot
}

export enum XpubTypes {
  'P2PKH' = 'P2PKH',
  'P2SH-P2WSH' = 'P2SH-P2WSH',
  'P2WSH' = 'P2WSH',
  'P2SH-P2WPKH' = 'P2SH-P2WPKH',
  'P2WPKH' = 'P2WPKH',
  'P2TR' = 'P2TR',
  'AMF' = 'AMF',
}

export enum ImportedKeyType {
  MNEMONIC = 'mnemonic',

  // Extended Public Keys - MAINNET
  XPUB = 'xpub',
  YPUB = 'ypub',
  ZPUB = 'zpub',

  // Extended Private Keys - MAINNET
  XPRV = 'xprv',
  YPRV = 'yprv',
  ZPRV = 'zprv',

  // Extended Public Keys - TESTNET
  TPUB = 'tpub',
  UPUB = 'upub',
  VPUB = 'vpub',

  // Extended Private Keys - TESTNET
  TPRV = 'tprv',
  UPRV = 'uprv',
  VPRV = 'vprv',
}
