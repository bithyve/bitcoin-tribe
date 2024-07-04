import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const TribeAppSchema: ObjectSchema = {
  name: RealmSchema.TribeApp,
  properties: {
    id: 'string',
    publicId: 'string',
    appName: 'string?',
    walletImage: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    networkType: 'string',
    version: 'string',
    enableAnalytics: { type: 'bool', default: false },
  },
  primaryKey: 'id',
};
