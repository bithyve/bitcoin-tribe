import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { AssetSchema, AssetSource, AssetVisibility } from 'src/models/interfaces/RGBWallet';

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

export const AssetTransactionSchema = {
  name: RealmSchema.AssetTransaction,
  properties: {
    amount: 'string',
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
    }
  },
};
