import {
  BIP85ConfigSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
  LabelSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
  InputSchema,
  OutputSchema,
  ScriptPubKeySchema,
  ScriptSigSchema,
} from './wallet';
import { TribeAppSchema } from './app';
import { VersionHistorySchema } from './versionHistory';
import { NodeConnectSchema, DefaultNodeConnectSchema } from './nodeConnect';
import {
  RgbWalletSchema,
  ReceiveDataSchema,
  NodeBtcBalanceSchema,
  ReceiveUTXOSchema,
} from './rgbwallet';
import {
  BalanceSchema,
  CoinSchema,
  AssetTransactionSchema,
  MetaData,
  AssignmentSchema,
  TransferTransportEndpointSchema,
  UtxoSchema,
} from './coin';
import { CollectibleMediaSchema, CollectibleSchema } from './collectible';
import { UniqueDigitalAssetSchema, TokenSchema } from './uda';
import { BackupHistorySchema } from './backupHistory';
import { CloudBackupHistorySchema } from './cloudBackupHistory';
import { NodeInfoSchema } from './nodeInfo';
import { IssuerSchema, IssuerVerifiedBySchema } from './issuer';
import {
  ConfirmationTimeSchema,
  NodeOnchainTransactionSchema,
} from './nodeOnchainTransaction';
import { LNPaymentsSchema } from './lnPayments';
import {
  CommunitySchema,
  MessageSchema,
  ContactSchema,
  RequestSchema,
} from './community';
import { ElectrumTransactionSchema, VinSchema, VoutSchema } from './electrumTransaction';

export default [
  TribeAppSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  BIP85ConfigSchema,
  UTXOSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
  LabelSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  WalletSpecsSchema,
  VersionHistorySchema,
  DefaultNodeConnectSchema,
  NodeConnectSchema,
  ReceiveDataSchema,
  RgbWalletSchema,
  CoinSchema,
  BalanceSchema,
  AssetTransactionSchema,
  MetaData,
  CollectibleMediaSchema,
  CollectibleSchema,
  UniqueDigitalAssetSchema,
  TokenSchema,
  BackupHistorySchema,
  CloudBackupHistorySchema,
  NodeInfoSchema,
  NodeBtcBalanceSchema,
  InputSchema,
  OutputSchema,
  ScriptPubKeySchema,
  ScriptSigSchema,
  IssuerSchema,
  IssuerVerifiedBySchema,
  NodeOnchainTransactionSchema,
  ConfirmationTimeSchema,
  LNPaymentsSchema,
  CommunitySchema,
  MessageSchema,
  ReceiveUTXOSchema,
  ContactSchema,
  RequestSchema,
  AssignmentSchema,
  TransferTransportEndpointSchema,
  UtxoSchema,
  ElectrumTransactionSchema,
  VinSchema,
  VoutSchema,
];
