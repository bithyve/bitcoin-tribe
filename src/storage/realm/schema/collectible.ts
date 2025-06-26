import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { AssetSchema, AssetSource, AssetVisibility } from 'src/models/interfaces/RGBWallet';

export const CollectibleMediaSchema: ObjectSchema = {
  name: RealmSchema.CollectibleMedia,
  embedded: true,
  properties: {
    filePath: 'string',
    mime: 'string',
    base64Image: 'string?',
  },
};

export const CollectibleSchema: ObjectSchema = {
  name: RealmSchema.Collectible,
  primaryKey: 'assetId',
  properties: {
    addedAt: 'int',
    assetId: 'string',
    balance: RealmSchema.Balance,
    details: 'string?',
    issuedSupply: 'int',
    media: RealmSchema.CollectibleMedia,
    name: 'string',
    precision: 'int',
    timestamp: 'int',
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
      default: AssetSchema.Collectible,
      optional: true,
    },
    assetSource: {
      type: 'string',
      default: AssetSource.Internal,
      optional: true,
    },
  },
};
