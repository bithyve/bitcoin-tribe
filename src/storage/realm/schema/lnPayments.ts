import { ObjectSchema } from 'realm';
import { RealmSchema } from 'src/storage/enum';

export const LNPaymentsSchema: ObjectSchema = {
  name: RealmSchema.LNPayments,
  properties: {
    amt_msat: 'int',
    asset_amount: 'int',
    asset_id: 'string',
    payment_hash: 'string',
    inbound: 'bool',
    status: 'string',
    created_at: 'int',
    updated_at: 'int',
    payee_pubkey: 'string',
  },
};
