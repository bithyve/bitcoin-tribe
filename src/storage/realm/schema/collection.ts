import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { AssetSchema, AssetSource, AssetVisibility } from 'src/models/interfaces/RGBWallet';

export const CollectionSchema: ObjectSchema = {
  name: RealmSchema.Collection,
  primaryKey: '_id',
  properties: {
    _id: 'string',
    name: 'string',
    description: 'string',
    itemsCount: 'int',
    isFixedSupply: 'bool',
    slug: 'string',
        addedAt: 'int',
    assetId: 'string',
    balance: RealmSchema.Balance,
    details: 'string',
    issuedSupply: 'string',
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
    assetSource: {
      type: 'string',
      default: AssetSource.Internal,
      optional: true,
    },
    items: `${RealmSchema.UniqueDigitalAsset}[]`,
  },
};