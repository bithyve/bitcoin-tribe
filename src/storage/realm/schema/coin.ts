import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const MetaData = {
  name: RealmSchema.MetaData,
  properties: {
    assetIface: 'string',
    assetSchema: 'string',
    issuedSupply: 'int',
    name: 'string',
    precision: 'int',
    ticker: 'string',
    timestamp: 'int',
  },
};

export const AssetTransactionSchema = {
  name: RealmSchema.AssetTransaction,
  properties: {
    amount: 'int',
    batchTransferIdx: 'int',
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
  },
};

export const CoinSchema: ObjectSchema = {
  name: RealmSchema.Coin,
  primaryKey: 'assetId',
  properties: {
    assetId: 'string',
    addedAt: 'int',
    assetIface: 'string',
    balance: `${RealmSchema.Balance}?`,
    issuedSupply: 'int',
    name: 'string',
    precision: 'int',
    ticker: 'string',
    timestamp: 'int',
    transactions: `${RealmSchema.AssetTransaction}[]`,
    metaData: `${RealmSchema.MetaData}`,
  },
};
