import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const ReceiveDataSchema: ObjectSchema = {
  name: RealmSchema.ReceiveData,
  embedded: true,
  properties: {
    batchTransferIdx: 'int?',
    expirationTimestamp: 'int',
    invoice: 'string',
    recipientId: 'string',
  },
};

export const NodeBtcBalanceSchema: ObjectSchema = {
  name: RealmSchema.NodeBtcBalance,
  embedded: true,
  properties: {
    vanilla: `${RealmSchema.Balance}?`,
    colored: `${RealmSchema.Balance}?`,
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
    utxos: 'string?[]',
    nodeUrl: 'string?',
    //nodeInfo: RealmSchema.NodeInfo,
    nodeAuthentication: 'string?',
    nodeBtcBalance: `${RealmSchema.NodeBtcBalance}?`,
  },
  primaryKey: 'mnemonic',
};
