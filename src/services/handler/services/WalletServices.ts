import config from 'src/utils/config';
import {
  NetworkType,
  TransactionKind,
  TxPriority,
} from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import WalletOperations from 'src/services/wallets/operations';
import ElectrumClient, { ELECTRUM_CLIENT } from 'src/services/electrum/client';
import {
  predefinedMainnetNodes,
  predefinedRegtestNodes,
  predefinedTestnetNodes,
  predefinedTestnet4Nodes,
} from 'src/services/electrum/predefinedNodes';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  NodeDetail,
  TransactionPrerequisite,
} from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Keys, Storage } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/services/relay';
import RGBServices from 'src/services/rgb/RGBServices';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { ServiceFeeType } from 'src/models/interfaces/Transactions';
import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import { refreshRgbWallet } from './RgbWalletServices';
import { getNodeOnchainBtcAddress } from './RLNServices';
import { backupAppImage } from './backupService';

function getTribeAppType(): AppType {
  const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
  return app?.appType;
}

function getNodeApi(): RLNNodeApiServices {
  const rgbWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
  return new RLNNodeApiServices({
    baseUrl: rgbWallet.nodeUrl,
    apiKey: rgbWallet.nodeAuthentication,
  });
}

function isNodeMode(appType: AppType): boolean {
  return appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN;
}

export async function connectToNode() {
  const defaultNodes =
    config.NETWORK_TYPE === NetworkType.TESTNET
      ? predefinedTestnetNodes
      : config.NETWORK_TYPE === NetworkType.REGTEST
        ? predefinedRegtestNodes
        : config.NETWORK_TYPE === NetworkType.TESTNET4
          ? predefinedTestnet4Nodes
          : predefinedMainnetNodes;

  const privateNodes: NodeDetail[] = dbManager.getCollection(
    RealmSchema.NodeConnect,
  ) as any;

  ElectrumClient.setActivePeer(defaultNodes, privateNodes);
  const { connected, connectedTo, error } = await ElectrumClient.connect();

  if (connected) {
    WalletOperations.calculateAverageTxFee().then(averageTxFeeByNetwork => {
      Storage.set(
        Keys.AVERAGE_TX_FEE_BY_NETWORK,
        JSON.stringify(averageTxFeeByNetwork),
      );
    });
  }

  return { connected, connectedTo, error };
}

export async function getTxRates() {
  WalletOperations.calculateAverageTxFee().then(averageTxFeeByNetwork => {
    Storage.set(
      Keys.AVERAGE_TX_FEE_BY_NETWORK,
      JSON.stringify(averageTxFeeByNetwork),
    );
  });
}

export async function refreshWallets({
  wallets,
  metaData = null,
}: {
  wallets: Wallet[];
  metaData?: Record<string, any> | null;
}) {
  try {
    const appType = getTribeAppType();
    if (isNodeMode(appType)) {
      const balances: any = await getNodeApi().getBtcBalance({
        skip_sync: false,
      });
      if (balances?.vanilla) {
        const rgbWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            nodeBtcBalance: balances,
          },
        );
        return balances;
      }
      return;
    }

    if (!ELECTRUM_CLIENT.isClientConnected) {
      ElectrumClient.resetCurrentPeerIndex();
      const { connected, connectedTo, error } = await connectToNode();
      if (connected) {
        console.log('Connected to: ', connectedTo);
      }
      if (error) {
        console.log('Node connection err: ', error);
        return;
      }
    }

    if (!wallets?.length) {
      return { synchedWallets: [] };
    }

    const network = WalletUtilities.getNetworkByType(wallets[0].networkType);
    const { synchedWallets }: { synchedWallets: Wallet[] } =
      await WalletOperations.syncWalletsViaElectrumClient(wallets, network);

    for (const synchedWallet of synchedWallets) {
      if (metaData) {
        synchedWallet.specs.transactions = synchedWallet.specs.transactions.map(tnx =>
          metaData[tnx.txid]
            ? {
                ...tnx,
                metadata: { ...metaData[tnx.txid] },
                transactionKind: TransactionKind.SERVICE_FEE,
              }
            : tnx,
        );
      }

      dbManager.updateObjectById(RealmSchema.Wallet, synchedWallet.id, {
        specs: synchedWallet.specs,
      });
    }

    return { synchedWallets };
  } catch (err) {
    console.log({ err });
  }
}

export async function sendPhaseOne({
  sender,
  recipient,
  averageTxFee,
  selectedPriority,
}: {
  sender: Wallet;
  recipient: { address: string; amount: number };
  averageTxFee: AverageTxFees;
  selectedPriority: TxPriority;
}): Promise<TransactionPrerequisite> {
  const recipients = [recipient];
  const { txPrerequisites } = await WalletOperations.transferST1(
    sender,
    recipients,
    averageTxFee,
    selectedPriority,
  );

  return txPrerequisites;
}

export async function sendPhaseTwo({
  sender,
  recipient,
  txPrerequisites,
  txPriority,
}: {
  sender: Wallet;
  recipient: { address: string; amount: number };
  txPrerequisites: TransactionPrerequisite;
  txPriority: TxPriority;
}): Promise<{ txid: string }> {
  const { txid } = await WalletOperations.transferST2(
    sender,
    txPrerequisites,
    txPriority,
    [recipient],
  );

  if (txid) {
    dbManager.updateObjectById(RealmSchema.Wallet, sender.id, {
      specs: sender.specs,
    });
    return { txid };
  }

  throw new Error('Failed to execute the transaction');
}

export async function payServiceFee({
  feeDetails,
  feeType = ServiceFeeType.REGISTER_ASSET_FEE,
  collectionId,
}: {
  feeDetails: { address: string; fee: number; includeTxFee?: boolean };
  feeType?: ServiceFeeType;
  collectionId?: string;
}): Promise<{ txid: string }> {
  const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
  await refreshWallets({ wallets: [wallet] });

  const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  if (!averageTxFeeJSON || typeof averageTxFeeJSON !== 'string') {
    throw new Error('Transaction fee data not found. Please try again later.');
  }

  let averageTxFeeByNetwork: AverageTxFeesByNetwork;
  try {
    averageTxFeeByNetwork = JSON.parse(averageTxFeeJSON);
  } catch (error) {
    throw new Error('Invalid transaction fee data. Please refresh and try again.');
  }

  const averageTxFee: AverageTxFees = averageTxFeeByNetwork[config.NETWORK_TYPE];
  const { low } = await sendPhaseOne({
    sender: wallet,
    recipient: {
      address: feeDetails.address,
      amount: feeDetails.fee,
    },
    averageTxFee,
    selectedPriority: TxPriority.LOW,
  });

  const { txid } = await sendToAddress({
    recipient: {
      address: feeDetails.address,
      amount: feeDetails.includeTxFee ? feeDetails.fee - low.fee : feeDetails.fee,
    },
    skipSync: false,
  });

  await refreshWallets({ wallets: [wallet] });
  if (txid) {
    await updateTransaction({
      txid,
      updateProps: {
        transactionKind: TransactionKind.SERVICE_FEE,
        metadata: {
          assetId: '',
          note: '',
          feeType,
          collectionId,
        },
      },
    });
  }

  return { txid };
}

export async function updateTransaction({
  txid,
  updateProps,
}: {
  txid: string;
  updateProps: Record<string, any>;
}): Promise<boolean> {
  try {
    const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
    const transactions = wallet.specs.transactions;
    const index = transactions.findIndex((tx: any) => tx.txid === txid);
    if (index < 0) return false;

    transactions[index] = {
      ...transactions[index],
      ...updateProps,
    };

    dbManager.updateObjectByPrimaryId(RealmSchema.Wallet, 'id', wallet.id, {
      specs: {
        transactions,
        ...wallet.specs,
      },
    });

    backupAppImage({
      tnxMeta: {
        txid,
        metaData: (transactions[index] as any).metadata,
      },
    });

    return true;
  } catch (error) {
    console.log('error', error);
    return false;
  }
}

export async function sendToAddress({
  recipient,
  skipSync = true,
}: {
  recipient: { address: string; amount: number };
  skipSync: boolean;
}): Promise<{ txid: string }> {
  const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
  const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  if (!averageTxFeeJSON || typeof averageTxFeeJSON !== 'string') {
    throw new Error('Transaction fee data not found. Please try again later.');
  }

  const averageTxFeeByNetwork: AverageTxFeesByNetwork = JSON.parse(averageTxFeeJSON);
  const averageTxFee: AverageTxFees = averageTxFeeByNetwork[config.NETWORK_TYPE];

  const txPrerequisites = await sendPhaseOne({
    sender: wallet,
    recipient,
    averageTxFee,
    selectedPriority: TxPriority.LOW,
  });

  if (!txPrerequisites) {
    throw new Error('Failed to generate txPrerequisites');
  }

  const { txid } = await sendPhaseTwo({
    sender: wallet,
    recipient,
    txPrerequisites,
    txPriority: TxPriority.LOW,
  });

  if (!skipSync) {
    await refreshWallets({ wallets: [wallet] });
  }

  return { txid };
}

export async function sendTransaction({
  sender,
  recipient,
  averageTxFee,
  selectedPriority,
  txPrerequisites,
}: {
  sender: Wallet;
  recipient: { address: string; amount: number };
  averageTxFee: AverageTxFees;
  selectedPriority: TxPriority;
  txPrerequisites: TransactionPrerequisite;
}): Promise<{ txid: string; txPrerequisites: TransactionPrerequisite }> {
  try {
    const appType = getTribeAppType();
    if (isNodeMode(appType)) {
      const nodeApi = getNodeApi();
      const response: any = await nodeApi.sendBTCTransaction({
        amount: recipient.amount,
        address: recipient.address,
        fee_rate: averageTxFee[selectedPriority].averageTxFee,
        skip_sync: false,
      });
      if (!response) {
        throw new Error('Failed to connect to node');
      }

      const feeEstimate: any = await nodeApi.estimateFee({ blocks: 7 });
      return {
        txid: response.txid,
        txPrerequisites: feeEstimate,
      };
    }

    const { txid } = await sendPhaseTwo({
      sender,
      recipient,
      txPrerequisites,
      txPriority: selectedPriority,
    });

    return {
      txid,
      txPrerequisites,
    };
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.message);
  }
}

export async function receiveTestSats() {
  try {
    const appType = getTribeAppType();
    if (isNodeMode(appType)) {
      const response: any = await getNodeOnchainBtcAddress();
      if (!response?.address) {
        throw new Error('Failed to get test coins');
      }

      const { funded } = await Relay.getTestcoins(response.address, config.NETWORK_TYPE);
      if (!funded) {
        throw new Error('Failed to get test coins');
      }

      await refreshWallets({ wallets: [] });
      return;
    }

    const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet) as Wallet;
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
    const { funded } = await Relay.getTestcoins(receivingAddress, wallet.networkType);
    if (!funded) {
      throw new Error('Failed to get test coins');
    }

    await refreshWallets({ wallets: [(wallet as any).toJSON ? (wallet as any).toJSON() : wallet] });
  } catch (error) {
    console.log({ error });
    throw new Error('Failed to get test coins');
  }
}

export async function createUtxos() {
  try {
    const appType = getTribeAppType();
    const nodeApi = isNodeMode(appType) ? getNodeApi() : undefined;
    if (isNodeMode(appType)) {
      const utxos = await RGBServices.createUtxos(5, appType, nodeApi as any);
      return utxos.created;
    }

    const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet) as Wallet;
    const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
    if (!averageTxFeeJSON || typeof averageTxFeeJSON !== 'string') {
      throw new Error('Transaction fee data not found. Please try again later.');
    }

    const averageTxFeeByNetwork: AverageTxFeesByNetwork = JSON.parse(averageTxFeeJSON);
    const averageTxFee = averageTxFeeByNetwork[wallet.networkType];

    const utxos = await RGBServices.createUtxos(
      averageTxFee.low.feePerByte,
      appType,
      nodeApi as any,
    );

    await refreshRgbWallet();
    await refreshWallets({
      wallets: [(wallet as any).toJSON ? (wallet as any).toJSON() : wallet],
    });

    if (utxos.created) {
      return utxos.created;
    }
    if (utxos.error) {
      throw new Error(`${utxos.error}`);
    }
    return false;
  } catch (error) {
    console.log({ error });
    throw error;
  }
}

export async function viewUtxos() {
  try {
    const appType = getTribeAppType();
    const nodeApi = isNodeMode(appType) ? getNodeApi() : undefined;
    const response = await RGBServices.getUnspents(appType, nodeApi as any);

    if (!Array.isArray(response)) {
      throw new Error(
        `Expected array but got: ${typeof response} — ${JSON.stringify(response)}`,
      );
    }

    if (response.length === 0) {
      return [];
    }

    const rgbWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
    const utxosData = response.map(utxo => JSON.stringify(utxo));
    dbManager.updateObjectByPrimaryId(
      RealmSchema.RgbWallet,
      'mnemonic',
      rgbWallet.mnemonic,
      {
        utxos: utxosData,
      },
    );

    return utxosData;
  } catch (error) {
    console.log('utxos', error);
    throw error;
  }
}

export async function getFeeAndExchangeRates() {
  const { exchangeRates, serviceFee } = await Relay.fetchFeeAndExchangeRates();
  Storage.set(Keys.EXCHANGE_RATES, JSON.stringify(exchangeRates.exchangeRates));
  if (serviceFee) {
    Storage.set(Keys.SERVICE_FEE, JSON.stringify(serviceFee));
  }
  await getTxRates();
}
