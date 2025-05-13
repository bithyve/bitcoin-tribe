import { RealmSchema } from '../../enum';

export const IssuerSchema = {
  name: RealmSchema.Issuer,
  properties: {
    verified: {
      type: 'bool',
      default: false,
    },
    isDomainVerified: {
      type: 'bool',
      default: false,
    },
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
    link: 'string?',
  },
};
