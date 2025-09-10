import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';
import { InvoiceType } from 'src/models/interfaces/RGBWallet';

export const ReceiveDataSchema: ObjectSchema = {
  name: RealmSchema.ReceiveData,
  properties: {
    batchTransferIdx: 'int?',
    expirationTimestamp: 'int',
    invoice: 'string',
    recipientId: 'string',
    type: {
      type: 'string',
      default: InvoiceType.Default
    }
  },
};

export const ReceiveUTXOSchema: ObjectSchema = {
  name: RealmSchema.ReceiveUTXOData,
  primaryKey: 'recipientId',
  properties: {
    recipientId: 'string',
    linkedAsset: 'string?',
    linkedAmount: 'string?',
    receiveData: `${RealmSchema.ReceiveData}?`,
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
    masterFingerprint: 'string',
    accountXpubColored: 'string',
    accountXpubVanilla: 'string',
    rgbDir: 'string?',
    receiveData: `${RealmSchema.ReceiveData}?`,
    receiveUTXOs: `${RealmSchema.ReceiveUTXOData}[]`,
    utxos: 'string?[]',
    nodeUrl: 'string?',
    nodeAuthentication: 'string?',
    nodeBtcBalance: `${RealmSchema.NodeBtcBalance}?`,
    peerDNS: 'string?',
    nodeOnchainTransactions: `${RealmSchema.NodeOnChainTransaction}[]`,
    lnPayments: `${RealmSchema.LNPayments}[]`,
    nodeMnemonic: 'string?',
    invoices: `${RealmSchema.ReceiveData}[]`,
  },
  primaryKey: 'mnemonic',
};
