import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const VinSchema: ObjectSchema = {
  name: "Vin",
  embedded: true,
  properties: {
    txid: "string?",
    vout: "int?",
    scriptSig: "ScriptSig?",
    sequence: "int?",
    txinwitness: "string[]",
  },
};


export const VoutSchema: ObjectSchema = {
  name: "Vout",
  embedded: true,
  properties: {
    n: "int?",
    value: "double?",
    scriptPubKey: "ScriptPubKey?",
  },
};

export const ElectrumTransactionSchema: ObjectSchema = {
  name: RealmSchema.ElectrumTransaction,
  embedded: true,
  properties: {
    txid: "string",
    hash: "string?",
    version: "int?",
    size: "int?",
    vsize: "int?",
    weight: "int?",
    locktime: "int?",
    blockhash: "string?",
    blocktime: "int?",
    confirmations: "int?",
    in_active_chain: "bool?",
    time: "int?",
    vin: "Vin[]",
    vout: "Vout[]",
  },
};
