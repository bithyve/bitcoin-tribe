import { NodeInfoResponse } from 'src/services/rgbnode';
import { LNPayments, NodeOnchainTransaction } from './Transactions';

export interface RGBWallet {
  mnemonic: string;
  xpub: string;
  rgbDir: string;
  accountXpub: string;
  accountXpubFingerprint: string;
  receiveData?: {
    invoice: string;
    recipientId: string;
    expirationTimestamp: number;
    batchTransferIdx: string;
  };
  utxos?: RgbUnspent[];
  nodeUrl?: string;
  nodeAuthentication?: string;
  nodeInfo?: NodeInfoResponse;
  nodeBtcBalance?: {
    vanilla: Balance;
    colored: Balance;
  };
  peerDNS?: string;
  nodeOnchainTransactions: NodeOnchainTransaction[];
  lnPayments: LNPayments[];
}
interface Balance {
  future: number;
  settled: number;
  spendable: number;
  offchainOutbound?: number;
  offchainInbound?: number;
}

export interface Transfer {
  amount: number;
  batchTransferIdx: number;
  createdAt: number;
  idx: number;
  kind: TransferKind;
  status: TransferStatus;
  updatedAt: number;
  txid: string | null;
  recipientId: string | null;
  expiration: number | null;
}

export interface MetaData {
  assetIface: string;
  assetSchema: string;
  issuedSupply: number;
  name: string;
  precision: number;
  ticker: string;
  timestamp: number;
}

export interface Issuer {
  verified: boolean;
  verifiedBy: {
    type: IssuerVerificationMethod;
    name?: string;
    id?: string;
    username?: string;
    link?: string;
  }[];
  isDomainVerified: boolean;
  domainVerifications: {
    domain: string;
    method: string;
    dnsRecords: {
      type: string;
      name: string;
      value: string;
    }[];
    userConfirmedDnsAdded: boolean;
    verifiedAt?: string;
    status: string;
  };
}

export interface Coin {
  addedAt: number;
  assetId: string;
  assetIface: AssetFace;
  balance: Balance;
  issuedSupply: number;
  name: string;
  precision: number;
  ticker: string;
  timestamp: number;
  transactions: Transfer[];
  metaData: MetaData;
  issuer: Issuer;
  visibility: AssetVisibility;
  isVerifyPosted: boolean;
  isIssuedPosted: boolean;
}

export interface Media {
  filePath: string;
  mime: string;
  digest?: string;
  base64Image?: string;
}
export interface Collectible {
  addedAt: number;
  assetId: string;
  assetIface: string;
  balance: Balance;
  details: string;
  issuedSupply: number;
  media: Media;
  name: string;
  precision: number;
  timestamp: number;
  metaData: MetaData;
  transactions: Transfer[];
  issuer: Issuer;
  visibility: AssetVisibility;
  isVerifyPosted: boolean;
  isIssuedPosted: boolean;
}

export interface UniqueDigitalAsset {
  addedAt: number;
  assetId: string;
  assetIface: string;
  balance: Balance;
  details: string;
  issuedSupply: number;
  name: string;
  precision: number;
  ticker: string;
  timestamp: number;
  token: {
    attachments: Media[];
    embeddedMedia: boolean;
    index: number;
    media: Media;
    reserves: boolean;
  };
  transactions: Transfer[];
  metaData: MetaData;
  issuer: Issuer;
  visibility: AssetVisibility;
  isVerifyPosted: boolean;
  isIssuedPosted: boolean;
}

export interface Asset extends Coin, Collectible, UniqueDigitalAsset {}
export interface RgbAllocation {
  amount: number;
  assetId: string;
  settled: boolean;
}

export interface RgbUtxo {
  btcAmount: number;
  colorable: boolean;
  exists: boolean;
  outpoint: {
    txid: string;
    vout: number;
  };
}
export interface RgbUnspent {
  rgbAllocations: RgbAllocation[];
  utxo: RgbUtxo;
}

export enum AssetType {
  Coin = 'Coin',
  Collectible = 'Collectible',
  UDA = 'UDA', //Unique Digital Asset
}

export enum AssetFace {
  RGB25 = 'RGB25', // Collectible(CFA)
  RGB20 = 'RGB20', // Coin(NIA)
  RGB21 = 'RGB21', //  Unique Digital Asset(UDA)
}

export enum AssetVisibility {
  DEFAULT = 'DEFAULT',
  HIDDEN = 'HIDDEN',
  // ARCHIVED = 'ARCHIVED',
}

export enum UtxoType {
  Colored = 'Colored',
  Colorable = 'Colorable',
  Uncolored = 'Uncolored',
}

export enum TransferKind {
  ISSUANCE = 'ISSUANCE',
  RECEIVE_BLIND = 'RECEIVE_BLIND',
  RECEIVE_WITNESS = 'RECEIVE_WITNESS',
  SEND = 'SEND',
}

export enum TransferStatus {
  WAITING_COUNTERPARTY = 'WAITING_COUNTERPARTY',
  WAITING_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
}

export enum IssuerVerificationMethod {
  TWITTER = 'twitter',
  DOMAIN = 'domain',
  TWITTER_POST = 'twitter_post',
}

export interface RgbNodeConnectParams {
  nodeUrl: string;
  nodeId: string;
  authentication: string;
  peerDNS?: string;
  mnemonic?: string;
}

export interface NodeInfo {
  pubkey?: string;
  numChannels?: number;
  numUsableChannels?: number;
  localBalanceMsat?: number;
  numPeers?: number;
  onchainPubkey?: string;
  maxMediaUploadSizeMb?: number;
  rgbHtlcMinMsat?: number;
  rgbChannelCapacityMinSat?: number;
  channelCapacityMinSat?: number;
  channelCapacityMaxSat?: number;
  channelAssetMinAmount?: number;
  channelAssetMaxAmount?: number;
}
