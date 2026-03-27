import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import {
  AssetSchema,
  AssetSource,
  AssetVisibility,
} from 'src/models/interfaces/RGBWallet';

export const IFASchema: ObjectSchema = {
    name: RealmSchema.IFA,
    primaryKey: 'assetId',
    properties: {
      assetId: 'string',
      isDefault: 'bool?',
      addedAt: 'int',
      balance: `${RealmSchema.Balance}?`,
      issuedSupply: 'string?',
      initialSupply: 'string?',
      knownCirculatingSupply: 'string?',
      maxSupply: 'string?',
      disclaimer: 'string?{}',
      name: 'string',
      details: 'string?',
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
        default: AssetSchema.IFA,
        optional: true,
      },
      assetSource: {
        type: 'string',
        default: AssetSource.Internal,
        optional: true,
      },
      campaign: 'string?{}',
    },
  };
  