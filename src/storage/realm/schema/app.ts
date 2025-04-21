import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import AppType from 'src/models/enums/AppType';

export const TribeAppSchema: ObjectSchema = {
  name: RealmSchema.TribeApp,
  properties: {
    id: 'string',
    publicId: 'string',
    appName: 'string?',
    walletImage: 'string?',
    primaryMnemonic: 'string?',
    primarySeed: 'string?',
    networkType: 'string',
    version: 'string',
    enableAnalytics: { type: 'bool', default: false },
    appType: { type: 'string', default: AppType.ON_CHAIN },
    authToken: 'string',
    keyPair: 'string{}'
  },
  primaryKey: 'id',
};
