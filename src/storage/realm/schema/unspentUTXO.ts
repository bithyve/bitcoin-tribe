import { RealmSchema } from 'src/storage/enum';

export const RGBUTXOSchema = {
  name: RealmSchema.RGBUTXOSchema,
  embedded: true,
  properties: {
    outpoint: RealmSchema.UnSpentOutpointSchema,
    btcAmount: 'int',
    colorable: 'bool',
    exists: 'bool',
  },
};

export const UnSpentOutpointSchema = {
  name: RealmSchema.UnSpentOutpointSchema,
  embedded: true,
  properties: {
    txid: 'string',
    vout: 'int',
  },
};

export const RGBAllocationSchema = {
  name: RealmSchema.RGBAllocationSchema,
  embedded: true,
  properties: {
    assetId: 'string',
    amount: 'int',
    settled: 'bool',
  },
};

export const UnspentRootObjectSchema = {
  name: RealmSchema.UnspentRootObjectSchema,
  properties: {
    utxo: RealmSchema.RGBUTXOSchema,
    rgbAllocations: `${RealmSchema.RGBAllocationSchema}[]`, // Correct way to define an array of objects
  },
};
