import { RealmSchema } from '../../enum';

export const IssuerSchema = {
  name: RealmSchema.Issuer,
  properties: {
    verified: {
      type: 'bool',
      default: false,
    },
    accessToken: 'string?',
    verifiedBy: `${RealmSchema.IssuerVerifiedBy}[]`,
  },
};

export const IssuerVerifiedBySchema = {
  name: RealmSchema.IssuerVerifiedBy,
  properties: {
    type: 'string',
    name: 'string?',
    id: 'string?',
    username: 'string?',
  },
};
