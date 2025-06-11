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

export const ReceiveUTXOSchema: ObjectSchema = {
  name: RealmSchema.ReceiveUTXOData,
  primaryKey: 'recipientId',
  properties: {
    batchTransferIdx: 'int?',
    expirationTimestamp: 'int',
    invoice: 'string',
    recipientId: 'string',
    linkedAsset: 'string?',
    linkedAmount: 'string?',
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
    accountXpubColoredFingerprint: 'string',
    accountXpubColored: 'string',
    accountXpubVanilla: 'string',
    rgbDir: 'string?',
    receiveData: `${RealmSchema.ReceiveData}?`,
    utxos: 'string?[]',
    nodeUrl: 'string?',
    nodeAuthentication: 'string?',
    nodeBtcBalance: `${RealmSchema.NodeBtcBalance}?`,
    peerDNS: 'string?',
    nodeOnchainTransactions: `${RealmSchema.NodeOnChainTransaction}[]`,
    lnPayments: `${RealmSchema.LNPayments}[]`,
  },
  primaryKey: 'mnemonic',
};
