import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { AssetSchema, AssetVisibility } from 'src/models/interfaces/RGBWallet';

export const UniqueDigitalAssetSchema: ObjectSchema = {
  name: RealmSchema.UniqueDigitalAsset,
  primaryKey: 'assetId',
  properties: {
    addedAt: 'int',
    assetId: 'string',
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
    issuer: `${RealmSchema.Issuer}`,
    visibility: {
      type: 'string',
      default: AssetVisibility.DEFAULT,
      optional: true,
    },
    isVerifyPosted: 'bool?',
    isIssuedPosted: 'bool?',
    assetSchema: {
      type: 'string',
      default: AssetSchema.UDA,
      optional: true,
    },
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
