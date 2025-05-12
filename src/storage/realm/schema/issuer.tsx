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
    domainVerifications: `${RealmSchema.IssuerDomainVerification}[]`,
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

export const IssuerDomainVerificationSchema = {
  name: RealmSchema.IssuerDomainVerification,
  embedded: true,
  properties: {
    domain: 'string',
    method: {
      type: 'string',
      default: 'dns',
    },
    dnsRecords: `${RealmSchema.DnsRecord}[]`,
    userConfirmedDnsAdded: {
      type: 'bool',
      default: false,
    },
    verifiedAt: 'date?',
    status: {
      type: 'string',
      default: 'pending',
    },
  },
};

export const DnsRecordSchema = {
  name: RealmSchema.DnsRecord,
  embedded: true,
  properties: {
    type: 'string',
    name: 'string',
    value: 'string',
  },
};
