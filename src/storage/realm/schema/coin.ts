import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import {
  AssetSchema,
  AssetSource,
  AssetVisibility,
} from 'src/models/interfaces/RGBWallet';

export const MetaData = {
  name: RealmSchema.MetaData,
  properties: {
    assetSchema: 'string',
    issuedSupply: 'string',
    name: 'string',
    precision: 'int?',
    ticker: 'string?',
    timestamp: 'int',
  },
};

export const AssignmentSchema = {
  name: RealmSchema.Assignment,
  properties: {
    amount: 'string?',
    type: 'string?',
  },
};

export const TransferTransportEndpointSchema = {
  name: RealmSchema.TransferTransportEndpoint,
  properties: {
    endpoint: 'string',
    transportType: 'string',
    used: 'bool',
  },
};

export const UtxoSchema = {
  name: RealmSchema.Utxo,
  properties: {
    txid: 'string',
    vout: 'int',
  },
};

export const AssetTransactionSchema = {
  name: RealmSchema.AssetTransaction,
  properties: {
    batchTransferIdx: 'int?',
    createdAt: 'int',
    idx: 'int',
    kind: 'string',
    status: 'string',
    transportEndpoints: `${RealmSchema.TransferTransportEndpoint}[]`,
    updatedAt: 'int',
    txid: 'string?',
    recipientId: 'string?',
    expiration: 'int?',
    requestedAssignment: `${RealmSchema.Assignment}?`,
    assignments: `${RealmSchema.Assignment}[]`,
    receiveUtxo: `${RealmSchema.Utxo}?`,
    changeUtxo: `${RealmSchema.Utxo}?`,
    invoiceString: 'string?',
  },
};

export const BalanceSchema: ObjectSchema = {
  name: RealmSchema.Balance,
  properties: {
    future: 'string?',
    settled: 'string?',
    spendable: 'string?',
    offchainOutbound: 'string?',
    offchainInbound: 'string?',
  },
};

export const CoinSchema: ObjectSchema = {
  name: RealmSchema.Coin,
  primaryKey: 'assetId',
  properties: {
    assetId: 'string',
    addedAt: 'int',
    balance: `${RealmSchema.Balance}?`,
    issuedSupply: 'string',
    disclaimer: 'string?{}',
    name: 'string',
    precision: 'int',
    ticker: 'string',
    iconUrl: 'string?',
    timestamp: 'int',
    transactions: `${RealmSchema.AssetTransaction}[]`,
    metaData: `${RealmSchema.MetaData}`,
    issuer: `${RealmSchema.Issuer}?`,
    visibility: {
      type: 'string',
      default: AssetVisibility.DEFAULT,
      optional: true,
    },
    isVerifyPosted: 'bool?',
    isIssuedPosted: 'bool?',
    assetSchema: {
      type: 'string',
      default: AssetSchema.Coin,
      optional: true,
    },
    assetSource: {
      type: 'string',
      default: AssetSource.Internal,
      optional: true,
    },
  },
};
