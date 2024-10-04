import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const ReceiveDataSchema: ObjectSchema = {
  name: RealmSchema.ReceiveData,
  embedded: true,
  properties: {
    batchTransferIdx: 'int',
    expirationTimestamp: 'int',
    invoice: 'string',
    recipientId: 'string',
  },
};

export const RgbWalletSchema: ObjectSchema = {
  name: RealmSchema.RgbWallet,
  properties: {
    mnemonic: 'string',
    xpub: 'string',
    accountXpub: 'string',
    accountXpubFingerprint: 'string',
    rgbDir: 'string?',
    receiveData: `${RealmSchema.ReceiveData}?`,
    unspentUTXOs: 'string?[]',
  },
  primaryKey: 'mnemonic',
};
