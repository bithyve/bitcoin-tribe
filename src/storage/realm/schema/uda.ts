import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const UniqueDigitalAssetSchema: ObjectSchema = {
  name: RealmSchema.UniqueDigitalAsset,
  primaryKey: 'assetId',
  properties: {
    addedAt: 'int',
    assetId: 'string',
    assetIface: 'string',
    balance: RealmSchema.Balance,
    details: 'string',
    issuedSupply: 'int',
    name: 'string',
    precision: 'int',
    ticker: 'string',
    timestamp: 'int',
    token: {
      type: 'object',
      objectType: RealmSchema.Token,
    },
    transactions: `${RealmSchema.AssetTransaction}[]`,
    metaData: `${RealmSchema.MetaData}`,
    visible: 'bool?',
    issuer: `${RealmSchema.Issuer}`,
  },
};

export const TokenSchema: ObjectSchema = {
  name: RealmSchema.Token,
  embedded: true,
  properties: {
    attachments: `${RealmSchema.CollectibleMedia}[]`,
    embeddedMedia: 'bool?',
    index: 'int?',
    media: `${RealmSchema.CollectibleMedia}?`,
    reserves: 'bool?',
  },
};
