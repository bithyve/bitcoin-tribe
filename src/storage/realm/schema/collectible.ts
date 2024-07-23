import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const CollectibleMediaSchema: ObjectSchema = {
  name: RealmSchema.CollectibleMedia,
  embedded: true,
  properties: {
    filePath: 'string',
    mime: 'string',
  },
};

export const CollectibleSchema: ObjectSchema = {
  name: RealmSchema.Collectible,
  primaryKey: 'assetId',
  properties: {
    addedAt: 'int',
    assetId: 'string',
    assetIface: 'string',
    balance: RealmSchema.Balance,
    details: 'string',
    issuedSupply: 'int',
    media: RealmSchema.CollectibleMedia,
    name: 'string',
    precision: 'int',
    timestamp: 'int',
    transactions: `${RealmSchema.AssetTransaction}[]`,
    metaData: `${RealmSchema.MetaData}`,
  },
};
