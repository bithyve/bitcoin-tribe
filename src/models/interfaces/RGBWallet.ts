export interface RGBWallet {
  mnemonic: string;
  xpub: string;
  rgbDir: string;
  accountXpub: string;
  accountXpubFingerprint: string;
  receiveData: {
    invoice: string;
    recipientId: string;
    expirationTimestamp: number;
    batchTransferIdx: string;
  };
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
