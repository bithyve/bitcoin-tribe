import { NodeInfoResponse } from 'src/services/rgbnode';

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
  utxos?: utxosRoot;
  nodeUrl?: string;
  nodeAuthentication?: string;
  nodeInfo?: NodeInfoResponse;
  nodeBtcBalance?: {
    vanilla: Balance;
    colored: Balance;
  };
}

// Define the structure of an object in the rgbAllocations array
interface RgbAllocation {
  key: string;
  value: any; // Adjust the type as needed, can be 'number', 'string', or other specific types
}

// Define the structure of the Outpoint object
interface Outpoint {
  txid: string; // Example field, represents a transaction ID
  index: number; // Example field, represents an output index
}

// Define the structure of the UTXO object
interface Utxo {
  btcAmount: number;
  colorable: boolean;
  exists: boolean;
  outpoint: Outpoint[]; // Array of Outpoint objects
}

// Define the unspentUTXOs interface
export interface utxosRoot {
  rgbAllocations: RgbAllocation[][]; // Array of array of RgbAllocation objects
  utxo: Utxo; // UTXO object
}

interface Balance {
  future: number;
  settled: number;
  spendable: number;
}

export interface Transaction {
  amount: number;
  batchTransferIdx: number;
  createdAt: number;
  idx: number;
  kind: string;
  status: string;
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

export interface Coin {
  addedAt: number;
  assetId: string;
  assetIface: string;
  balance: Balance;
  issuedSupply: number;
  name: string;
  precision: number;
  ticker: string;
  timestamp: number;
  transactions: Transaction[];
  metaData: MetaData;
}

interface Media {
  filePath: string;
  mime: string;
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
}

export interface Asset extends Coin, Collectible {}
interface RgbAllocation {
  amount: number;
  assetId: string;
  settled: boolean;
}
interface Outpoint {
  txid: string;
  vout: number;
}
interface Utxo {
  btcAmount: number;
  colorable: boolean;
  exists: boolean;
  outpoint: Outpoint;
}
export interface RgbUnspent {
  rgbAllocations: RgbAllocation[];
  utxo: Utxo;
}

export enum AssetType {
  Coin = 'Coin',
  Collectible = 'Collectible',
}

export enum AssetFace {
  RGB25 = 'RGB25',
  RGB20 = 'RGB20',
}

export interface RgbNodeConnectParams {
  nodeUrl: string;
  nodeId: string;
  authentication: string;
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
