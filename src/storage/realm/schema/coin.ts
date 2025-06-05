import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { AssetSchema, AssetVisibility } from 'src/models/interfaces/RGBWallet';

export const MetaData = {
  name: RealmSchema.MetaData,
  properties: {
    assetSchema: 'string',
    issuedSupply: 'int',
    name: 'string',
    precision: 'int?',
    ticker: 'string?',
    timestamp: 'int',
  },
};

export const AssetTransactionSchema = {
  name: RealmSchema.AssetTransaction,
  properties: {
    amount: 'int',
    batchTransferIdx: 'int?',
    createdAt: 'int',
    idx: 'int',
    kind: 'string',
    status: 'string',
    //transportEndpoints: 'string[]',
    updatedAt: 'int',
    txid: 'string?',
    recipientId: 'string?',
    expiration: 'int?',
  },
};

export const BalanceSchema: ObjectSchema = {
  name: RealmSchema.Balance,
  properties: {
    future: 'int?',
    settled: 'int?',
    spendable: 'int?',
    offchainOutbound: 'int?',
    offchainInbound: 'int?',
  },
};

export const CoinSchema: ObjectSchema = {
  name: RealmSchema.Coin,
  primaryKey: 'assetId',
  properties: {
    assetId: 'string',
    addedAt: 'int',
    balance: `${RealmSchema.Balance}?`,
    issuedSupply: 'int',
    name: 'string',
    precision: 'int',
    ticker: 'string',
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
  },
};
