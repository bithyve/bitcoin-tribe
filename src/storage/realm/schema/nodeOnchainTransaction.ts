import { ObjectSchema } from 'realm';
import { RealmSchema } from 'src/storage/enum';

export const ConfirmationTimeSchema: ObjectSchema = {
  name: 'ConfirmationTime',
  embedded: true,
  properties: {
    height: 'int',
    timestamp: 'int',
  },
};

export const NodeOnchainTransactionSchema: ObjectSchema = {
  name: RealmSchema.NodeOnChainTransaction,
  properties: {
    transaction_type: 'string',
    txid: 'string',
    received: 'int',
    sent: 'int',
    fee: 'int',
    confirmation_time: 'ConfirmationTime?',
  },
};
