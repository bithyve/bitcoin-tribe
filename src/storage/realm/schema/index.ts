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
} from './wallet';
import { TribeAppSchema } from './app';
import { VersionHistorySchema } from './versionHistory';
import { NodeConnectSchema, DefaultNodeConnectSchema } from './nodeConnect';
import { RgbWalletSchema, ReceiveDataSchema } from './rgbwallet';
import {
  BalanceSchema,
  CoinSchema,
  AssetTransactionSchema,
  MetaData,
} from './coin';
import { CollectibleMediaSchema, CollectibleSchema } from './collectible';
import { BackupHistorySchema } from './backupHistory';
import { CloudBackupHistorySchema } from './cloudBackupHistory';

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
  BackupHistorySchema,
  CloudBackupHistorySchema,
];
