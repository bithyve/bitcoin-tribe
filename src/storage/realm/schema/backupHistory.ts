import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const BackupHistorySchema: ObjectSchema = {
  name: RealmSchema.BackupHistory,
  properties: {
    title: 'string',
    date: 'string',
    confirmed: 'bool',
    subtitle: {
      optional: true,
      type: 'string',
    },
  },
};
