/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bitcoinJS from 'bitcoinjs-lib';

import ECPairFactory from 'ecpair';
import coinselect from 'coinselect';
import coinselectSplit from 'coinselect/split';
import config from 'src/utils/config';
import ElectrumClient from 'src/services/electrum/client';
import idx from 'idx';
import RestClient from 'src/services/rest/RestClient';
import ecc from './taproot-utils/noble_ecc';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  Balances,
  InputUTXOs,
  OutputUTXOs,
  SerializedPSBTEnvelop,
  Transaction,
  TransactionPrerequisite,
  UTXO,
} from '../interfaces';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  NetworkType,
  ScriptTypes,
  TransactionType,
  TxPriority,
} from '../enums';
import {
  AddressCache,
  AddressPubs,
  Wallet,
  WalletSpecs,
} from '../interfaces/wallet';
import WalletUtilities from './utils';

bitcoinJS.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

const TESTNET_FEE_CUTOFF = 10;

const testnetFeeSurcharge = (wallet: Wallet) =>
  /* !! TESTNET ONLY !!
     as the redeem script for vault is heavy(esp. 3-of-5/3-of-6),
     the nodes reject the tx if the overall fee for the tx is low(which is the case w/ electrum)
     therefore we up the feeRatesPerByte by 1 to handle this case until we find a better sol
    */
  config.NETWORK_TYPE === NetworkType.TESTNET ? 1 : 0;

const deepClone = obj => JSON.parse(JSON.stringify(obj));

const updateOutputsForFeeCalculation = (outputs, network) => {
  for (const o of outputs) {
    if (
      o.address &&
      (o.address.startsWith('bcrt1') ||
        o.address.startsWith('bc1') ||
        o.address.startsWith('tb1'))
    ) {
      // in case address is non-typical and takes more bytes than coinselect library anticipates by default
      o.script = {
        length:
          bitcoinJS.address.toOutputScript(
            o.address,
            network === NetworkType.MAINNET
              ? bitcoinJS.networks.bitcoin
              : network === NetworkType.REGTEST
              ? bitcoinJS.networks.regtest
              : bitcoinJS.networks.testnet,
          ).length + 3,
      };
    }
  }
  return outputs;
};

const updateInputsForFeeCalculation = (wallet: Wallet, inputUTXOs) => {
  const isNativeSegwit =
    wallet.scriptType === ScriptTypes.P2WPKH ||
    wallet.scriptType === ScriptTypes.P2WSH;
  const isWrappedSegwit =
    wallet.scriptType === ScriptTypes['P2SH-P2WPKH'] ||
    wallet.scriptType === ScriptTypes['P2SH-P2WSH'];
  const isTaproot = wallet.scriptType === ScriptTypes.P2TR;
  console.log('isTaproot', isTaproot);
  console.log('updateInputsForFeeCalculation inputUTXOs', inputUTXOs);
  return inputUTXOs.map(u => {
    if (isTaproot) {
      u.script = { length: 15 }; // P2TR
    } else if (isNativeSegwit) {
      u.script = { length: 27 }; // P2WPKH
    } else if (isWrappedSegwit) {
      u.script = { length: 50 }; // P2SH-P2WPKH
    } else {
      u.script = { length: 107 }; // Legacy P2PKH
    }
    return u;
  });
};

export default class WalletOperations {
  public static getNextFreeExternalAddress = (
    wallet: Wallet,
  ): { receivingAddress: string } => {
    let receivingAddress;
    const { entityKind, specs, networkType } = wallet;
    const network = WalletUtilities.getNetworkByType(networkType);

    const cached = idx(
      specs,
      _ => _.addresses.external[specs.nextFreeAddressIndex],
    ); // address cache hit
    if (cached) {
      return { receivingAddress: cached };
    }

    // case: single-sig wallet
    const xpub = (specs as WalletSpecs).xpub;
    const derivationPath = (wallet as Wallet)?.derivationDetails
      ?.xDerivationPath;

    const purpose = WalletUtilities.getPurpose(derivationPath);

    receivingAddress = WalletUtilities.getAddressByIndex(
      xpub,
      false,
      specs.nextFreeAddressIndex,
      network,
      purpose,
    );

    return {
      receivingAddress,
    };
  };

  public static getNextFreeChangeAddress = (
    wallet: Wallet,
  ): { changeAddress: string } => {
    let changeAddress;
    const { entityKind, specs, networkType } = wallet;
    const network = WalletUtilities.getNetworkByType(networkType);

    const cached = idx(
      specs,
      _ => _.addresses.internal[specs.nextFreeChangeAddressIndex],
    ); // address cache hit
    if (cached) {
      return { changeAddress: cached };
    }

    // case: single-sig wallet
    const xpub = (specs as WalletSpecs).xpub;
    const derivationPath = (wallet as Wallet)?.derivationDetails
      ?.xDerivationPath;

    const purpose = WalletUtilities.getPurpose(derivationPath);

    changeAddress = WalletUtilities.getAddressByIndex(
      xpub,
      true,
      specs.nextFreeChangeAddressIndex,
      network,
      purpose,
    );

    return {
      changeAddress,
    };
  };

  static getNextFreeAddress = (wallet: Wallet) => {
    if (wallet.specs.receivingAddress) {
      return wallet.specs.receivingAddress;
    }
    const { receivingAddress } =
      WalletOperations.getNextFreeExternalAddress(wallet);
    return receivingAddress;
  };

  static transformElectrumTxToTx = (
    tx,
    inputTxs,
    externalAddresses,
    internalAddresses,
    txidToAddress,
  ) => {
    // popluate tx-inputs with addresses and values
    const inputs = tx.vin;
    for (let index = 0; index < tx.vin.length; index++) {
      const input = inputs[index];

      const inputTx = inputTxs[input.txid];
      if (inputTx && inputTx.vout[input.vout]) {
        const vout = inputTx.vout[input.vout];
        input.addresses = vout.scriptPubKey.addresses;
        input.value = vout.value;
      }
    }

    // calculate cumulative amount and transaction type
    const outputs = tx.vout;
    let fee = 0; // delta b/w inputs and outputs
    let amount = 0;
    const senderAddresses = [];
    const recipientAddresses = [];

    for (const input of inputs) {
      const inputAddress = input.addresses[0];
      if (
        externalAddresses[inputAddress] !== undefined ||
        internalAddresses[inputAddress] !== undefined
      ) {
        amount -= input.value;
      }

      senderAddresses.push(inputAddress);
      fee += input.value;
    }

    for (const output of outputs) {
      if (!output.scriptPubKey.addresses) {
        continue;
      } // OP_RETURN w/ no value(tx0)

      const outputAddress = output.scriptPubKey.addresses[0];
      if (
        externalAddresses[outputAddress] !== undefined ||
        internalAddresses[outputAddress] !== undefined
      ) {
        amount += output.value;
      }

      recipientAddresses.push(outputAddress);
      fee -= output.value;
    }

    const transaction: Transaction = {
      txid: tx.txid,
      address: txidToAddress[tx.txid],
      confirmations: tx.confirmations ? tx.confirmations : 0,
      fee: Math.floor(fee * 1e8),
      date: tx.time
        ? new Date(tx.time * 1000).toUTCString()
        : new Date(Date.now()).toUTCString(),
      transactionType:
        amount > 0 ? TransactionType.RECEIVED : TransactionType.SENT,
      amount: Math.floor(Math.abs(amount) * 1e8),
      recipientAddresses,
      senderAddresses,
      blockTime: tx.blocktime,
      inputs: inputs,
      outputs: outputs,
    };
    return transaction;
  };

  static fetchTransactions = async (
    wallet: Wallet,
    addresses: string[],
    externalAddresses: { [address: string]: number },
    internalAddresses: { [address: string]: number },
    network: bitcoinJS.Network,
  ) => {
    const transactions = wallet.specs.transactions;
    let lastUsedAddressIndex = wallet.specs.nextFreeAddressIndex - 1;
    let lastUsedChangeAddressIndex =
      wallet.specs.nextFreeChangeAddressIndex - 1;

    const txidToIndex = {}; // transaction-id to index mapping(assists transaction updation)
    for (let index = 0; index < transactions.length; index++) {
      const transaction = transactions[index];
      txidToIndex[transaction.txid] = index;
    }

    const { txids, txidToAddress } = await ElectrumClient.syncHistoryByAddress(
      addresses,
      network,
    );
    const txs = await ElectrumClient.getTransactionsById(txids);

    // fetch input transactions(for new ones), in order to construct the inputs
    const inputTxIds = [];
    for (const txid in txs) {
      if (txidToIndex[txid] !== undefined) {
        continue;
      } // transaction is already present(don't need to reconstruct using inputTxids)
      for (const vin of txs[txid].vin) {
        inputTxIds.push(vin.txid);
      }
    }
    const inputTxs = await ElectrumClient.getTransactionsById(inputTxIds);

    let hasNewUpdates = false;
    const newTransactions: Transaction[] = [];
    // construct a new or update an existing transaction
    for (const txid in txs) {
      let existingTx: Transaction;
      if (txidToIndex[txid] !== undefined) {
        existingTx = transactions[txidToIndex[txid]];
      }

      const tx = txs[txid];

      // update the last used address/change-address index
      const address = txidToAddress[tx.txid];
      if (externalAddresses[address] !== undefined) {
        if (externalAddresses[address] > lastUsedAddressIndex) {
          lastUsedAddressIndex = externalAddresses[address];
          hasNewUpdates = true;
        }
      } else if (internalAddresses[address] !== undefined) {
        if (internalAddresses[address] > lastUsedChangeAddressIndex) {
          lastUsedChangeAddressIndex = internalAddresses[address];
          hasNewUpdates = true;
        }
      }

      if (existingTx) {
        // transaction already exists in the database, should update till transaction has 3+ confs
        if (!tx.confirmations) {
          continue;
        } // unconfirmed transaction
        if (existingTx.confirmations > 3) {
          continue;
        } // 3+ confs
        if (existingTx.confirmations !== tx.confirmations) {
          // update transaction confirmations
          existingTx.confirmations = tx.confirmations;
          hasNewUpdates = true;
        }
      } else {
        // new transaction construction
        const transaction = WalletOperations.transformElectrumTxToTx(
          tx,
          inputTxs,
          externalAddresses,
          internalAddresses,
          txidToAddress,
        );
        hasNewUpdates = true;
        newTransactions.push(transaction);
      }
    }

    newTransactions.sort((tx1, tx2) =>
      tx1.confirmations > tx2.confirmations ? 1 : -1,
    );
    return {
      transactions: newTransactions.concat(transactions),
      hasNewUpdates,
      lastUsedAddressIndex,
      lastUsedChangeAddressIndex,
    };
  };

  static syncWalletsViaElectrumClient = async (
    wallets: Wallet[],
    network: bitcoinJS.networks.Network,
  ): Promise<{
    synchedWallets: Wallet[];
  }> => {
    for (const wallet of wallets) {
      const addresses = [];

      let purpose;
      if (wallet.entityKind === EntityKind.WALLET) {
        purpose = WalletUtilities.getPurpose(
          (wallet as Wallet).derivationDetails.xDerivationPath,
        );
      }

      const addressCache: AddressCache = wallet.specs.addresses || {
        external: {},
        internal: {},
      };
      const addressPubs: AddressPubs = wallet.specs.addressPubs || {};

      // collect external(receive) chain addresses
      const externalAddresses: { [address: string]: number } = {}; // all external addresses(till closingExtIndex)
      for (
        let itr = 0;
        itr < wallet.specs.nextFreeAddressIndex + config.GAP_LIMIT;
        itr++
      ) {
        let address: string;
        let pubsToCache: string[];
        if (addressCache.external[itr]) {
          address = addressCache.external[itr];
        } // cache hit
        else {
          // cache miss

          let xpub = null;
          xpub = (wallet as Wallet).specs.xpub;

          const singlesig = WalletUtilities.getAddressAndPubByIndex(
            xpub,
            false,
            itr,
            network,
            purpose,
          );
          address = singlesig.address;
          pubsToCache = [singlesig.pub];

          addressCache.external[itr] = address;
          addressPubs[address] = pubsToCache.join('/');
        }

        externalAddresses[address] = itr;
        addresses.push(address);
      }

      // collect internal(change) chain addresses
      const internalAddresses: { [address: string]: number } = {}; // all internal addresses(till closingIntIndex)
      for (
        let itr = 0;
        itr < wallet.specs.nextFreeChangeAddressIndex + config.GAP_LIMIT;
        itr++
      ) {
        let address: string;
        let pubsToCache: string[];

        if (addressCache.internal[itr]) {
          address = addressCache.internal[itr];
        } // cache hit
        else {
          // cache miss

          let xpub = null;
          xpub = (wallet as Wallet).specs.xpub;

          const singlesig = WalletUtilities.getAddressAndPubByIndex(
            xpub,
            true,
            itr,
            network,
            purpose,
          );
          address = singlesig.address;
          pubsToCache = [singlesig.pub];

          addressCache.internal[itr] = address;
          addressPubs[address] = pubsToCache.join('/');
        }

        internalAddresses[address] = itr;
        addresses.push(address);
      }

      // sync utxos & balances
      const utxosByAddress = await ElectrumClient.syncUTXOByAddress(
        addresses,
        network,
      );

      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      };
      const confirmedUTXOs: InputUTXOs[] = [];
      const unconfirmedUTXOs: InputUTXOs[] = [];
      for (const address in utxosByAddress) {
        const utxos = utxosByAddress[address];
        for (const utxo of utxos) {
          if (
            utxo.height > 0 ||
            internalAddresses[utxo.address] !== undefined
          ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push(utxo);
            balances.confirmed += utxo.value;
          } else {
            unconfirmedUTXOs.push(utxo);
            balances.unconfirmed += utxo.value;
          }
        }
      }

      // sync & populate transactionsInfo
      const {
        transactions,
        lastUsedAddressIndex,
        lastUsedChangeAddressIndex,
        hasNewUpdates,
      } = await WalletOperations.fetchTransactions(
        wallet,
        addresses,
        externalAddresses,
        internalAddresses,
        network,
      );

      // update wallet w/ latest utxos, balances and transactions
      wallet.specs.nextFreeAddressIndex = lastUsedAddressIndex + 1;
      wallet.specs.nextFreeChangeAddressIndex = lastUsedChangeAddressIndex + 1;
      wallet.specs.addresses = addressCache;
      wallet.specs.addressPubs = addressPubs;
      wallet.specs.receivingAddress =
        WalletOperations.getNextFreeExternalAddress(wallet).receivingAddress;
      wallet.specs.unconfirmedUTXOs = unconfirmedUTXOs;
      wallet.specs.confirmedUTXOs = confirmedUTXOs;
      wallet.specs.balances = balances;
      wallet.specs.transactions = transactions;
      wallet.specs.hasNewUpdates = hasNewUpdates;
      wallet.specs.lastSynched = Date.now();
    }

    return {
      synchedWallets: wallets,
    };
  };

  static removeConsumedUTXOs = (wallet: Wallet, inputs: InputUTXOs[]) => {
    const consumedUTXOs: { [txid: string]: InputUTXOs } = {};
    inputs.forEach(input => {
      consumedUTXOs[input.txId] = input;
    });

    // update the utxo set and balance
    const updatedConfirmedUTXOSet = [];
    wallet.specs.confirmedUTXOs.forEach(confirmedUTXO => {
      if (!consumedUTXOs[confirmedUTXO.txId]) {
        updatedConfirmedUTXOSet.push(confirmedUTXO);
      }
    });
    wallet.specs.confirmedUTXOs = updatedConfirmedUTXOSet;

    const updatedUnconfirmedUTXOSet = [];
    wallet.specs.unconfirmedUTXOs.forEach(unconfirmedUTXO => {
      if (!consumedUTXOs[unconfirmedUTXO.txId]) {
        updatedUnconfirmedUTXOSet.push(unconfirmedUTXO);
      }
    });
    wallet.specs.unconfirmedUTXOs = updatedUnconfirmedUTXOSet;
  };

  static mockFeeRates = () => {
    // final safety net, enables send flow and consequently the usability of custom fee during fee-info failure scenarios

    // high fee: 10 minutes
    const highFeeBlockEstimate = 1;
    const high = {
      feePerByte: 5,
      estimatedBlocks: highFeeBlockEstimate,
    };

    // medium fee: 30 mins
    const mediumFeeBlockEstimate = 3;
    const medium = {
      feePerByte: 3,
      estimatedBlocks: mediumFeeBlockEstimate,
    };

    // low fee: 60 mins
    const lowFeeBlockEstimate = 6;
    const low = {
      feePerByte: 1,
      estimatedBlocks: lowFeeBlockEstimate,
    };
    const feeRatesByPriority = { high, medium, low };
    return feeRatesByPriority;
  };

  static regtestFeeRates = () => {
    // final safety net, enables send flow and consequently the usability of custom fee during fee-info failure scenarios

    // high fee: 10 minutes
    const highFeeBlockEstimate = 1;
    const high = {
      feePerByte: 20,
      estimatedBlocks: highFeeBlockEstimate,
      averageTxFee: 20,
    };

    // medium fee: 30 mins
    const mediumFeeBlockEstimate = 1;
    const medium = {
      feePerByte: 9,
      estimatedBlocks: mediumFeeBlockEstimate,
      averageTxFee: 9,
    };

    // low fee: 60 mins
    const lowFeeBlockEstimate = 1;
    const low = {
      feePerByte: 6,
      estimatedBlocks: lowFeeBlockEstimate,
      averageTxFee: 6,
    };
    const feeRatesByPriority = { high, medium, low };
    return feeRatesByPriority;
  };

  static estimateFeeRatesViaElectrum = async () => {
    try {
      // high fee: 10 minutes
      const highFeeBlockEstimate = 1;
      const high = {
        feePerByte: Math.round(
          await ElectrumClient.estimateFee(highFeeBlockEstimate),
        ),
        estimatedBlocks: highFeeBlockEstimate,
      };

      // medium fee: 30 mins
      const mediumFeeBlockEstimate = 3;
      const medium = {
        feePerByte: Math.round(
          await ElectrumClient.estimateFee(mediumFeeBlockEstimate),
        ),
        estimatedBlocks: mediumFeeBlockEstimate,
      };

      // low fee: 60 mins
      const lowFeeBlockEstimate = 6;
      const low = {
        feePerByte: Math.round(
          await ElectrumClient.estimateFee(lowFeeBlockEstimate),
        ),
        estimatedBlocks: lowFeeBlockEstimate,
      };
      if (
        config.NETWORK_TYPE === NetworkType.TESTNET &&
        low.feePerByte > TESTNET_FEE_CUTOFF
      ) {
        // working around testnet fee spikes
        return WalletOperations.mockFeeRates();
      }

      const feeRatesByPriority = { high, medium, low };
      return feeRatesByPriority;
    } catch (err) {
      console.log('Failed to fetch fee via Fulcrum', { err });
      throw new Error('Failed to fetch fee via Fulcrum');
    }
  };

  static fetchFeeRatesByPriority = async () => {
    // main: mempool.space, fallback: fulcrum target block based fee estimator
    try {
      let endpoint;
      if (config.NETWORK_TYPE === NetworkType.TESTNET) {
        endpoint = 'https://mempool.space/testnet/api/v1/fees/recommended';
      } else {
        endpoint = 'https://mempool.space/api/v1/fees/recommended';
      }

      const res = await RestClient.get(endpoint);
      const mempoolFee: {
        economyFee: number;
        fastestFee: number;
        halfHourFee: number;
        hourFee: number;
        minimumFee: number;
      } = res.data;

      // high fee: 10 minutes
      const highFeeBlockEstimate = 1;
      const high = {
        feePerByte: mempoolFee.fastestFee,
        estimatedBlocks: highFeeBlockEstimate,
      };

      // medium fee: 30 minutes
      const mediumFeeBlockEstimate = 3;
      const medium = {
        feePerByte: mempoolFee.halfHourFee,
        estimatedBlocks: mediumFeeBlockEstimate,
      };

      // low fee: 60 minutes
      const lowFeeBlockEstimate = 6;
      const low = {
        feePerByte: mempoolFee.hourFee,
        estimatedBlocks: lowFeeBlockEstimate,
      };
      if (
        config.NETWORK_TYPE === NetworkType.TESTNET &&
        low.feePerByte > TESTNET_FEE_CUTOFF
      ) {
        // working around testnet fee spikes
        return WalletOperations.mockFeeRates();
      }
      const feeRatesByPriority = { high, medium, low };
      return feeRatesByPriority;
    } catch (err) {
      console.log('Failed to fetch fee via mempool.space', { err });
      try {
        if (config.NETWORK_TYPE === NetworkType.TESTNET) {
          throw new Error(
            'Take mock fee, testnet3 fee via electrum is unstable',
          );
        }
        return WalletOperations.estimateFeeRatesViaElectrum();
      } catch (err) {
        console.log({ err });
        return WalletOperations.mockFeeRates();
      }
    }
  };

  static calculateAverageTxFee = async () => {
    const feeRatesByPriority = await WalletOperations.fetchFeeRatesByPriority();
    const averageTxSize = 226; // the average Bitcoin transaction is about 226 bytes in size (1 Inp (148); 2 Out)
    const averageTxFees: AverageTxFees = {
      high: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority.high.feePerByte,
        ),
        feePerByte: feeRatesByPriority.high.feePerByte,
        estimatedBlocks: feeRatesByPriority.high.estimatedBlocks,
      },
      medium: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority.medium.feePerByte,
        ),
        feePerByte: feeRatesByPriority.medium.feePerByte,
        estimatedBlocks: feeRatesByPriority.medium.estimatedBlocks,
      },
      low: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority.low.feePerByte,
        ),
        feePerByte: feeRatesByPriority.low.feePerByte,
        estimatedBlocks: feeRatesByPriority.low.estimatedBlocks,
      },
    };

    // configure to procure fee by network type
    const averageTxFeeByNetwork: AverageTxFeesByNetwork = {
      [NetworkType.TESTNET]: averageTxFees,
      [NetworkType.MAINNET]: averageTxFees,
      [NetworkType.REGTEST]: this.regtestFeeRates(),
    };
    return averageTxFeeByNetwork;
  };

  static calculateSendMaxFee = (
    wallet: Wallet,
    recipients: {
      address: string;
      amount: number;
    }[],
    feePerByte: number,
    selectedUTXOs?: UTXO[],
  ): number => {
    const inputUTXOs =
      selectedUTXOs && selectedUTXOs.length
        ? selectedUTXOs
        : [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    let confirmedBalance = 0;
    inputUTXOs.forEach(utxo => {
      confirmedBalance += utxo.value;
    });
    const outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: confirmedBalance,
      });
    }
    const { fee } = coinselect(inputUTXOs, outputUTXOs, feePerByte);
    return fee;
  };

  static prepareTransactionPrerequisites = (
    wallet: Wallet,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
    selectedPriority: TxPriority,
    selectedUTXOs?: UTXO[],
  ):
    | {
        fee: number;
        balance: number;
        txPrerequisites?;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?;
        balance?;
      } => {
    const inputUTXOs =
      selectedUTXOs && selectedUTXOs.length
        ? selectedUTXOs
        : [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    let confirmedBalance = 0;
    inputUTXOs.forEach(utxo => {
      confirmedBalance += utxo.value;
    });
    const outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: recipient.amount,
      });
    }
    const feePerByte = averageTxFees[selectedPriority].feePerByte;
    const estimatedBlocks = averageTxFees[selectedPriority].estimatedBlocks;
    const assets = coinselect(inputUTXOs, outputUTXOs, feePerByte);
    const priorityInputs = assets.inputs;
    const priorityOutputs = assets.outputs;
    const priorityFee = assets.fee;
    let netAmount = 0;
    recipients.forEach(recipient => {
      netAmount += recipient.amount;
    });
    const amountToDebit = netAmount + priorityFee;

    if (!priorityInputs || amountToDebit > confirmedBalance) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
      return {
        fee: priorityFee,
        balance: confirmedBalance,
      };
    }

    const txPrerequisites: TransactionPrerequisite = {
      [selectedPriority]: {
        inputs: priorityInputs,
        outputs: priorityOutputs,
        fee: priorityFee,
        estimatedBlocks: estimatedBlocks,
      },
    };

    return {
      txPrerequisites,
    };
  };

  static prepareCustomTransactionPrerequisites = (
    wallet: Wallet,
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    selectedUTXOs?: UTXO[],
  ): TransactionPrerequisite => {
    const inputUTXOs =
      selectedUTXOs && selectedUTXOs.length
        ? selectedUTXOs
        : [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte + testnetFeeSurcharge(wallet),
    );

    if (!inputs) {
      return { fee };
    }

    return {
      [TxPriority.CUSTOM]: {
        inputs,
        outputs,
        fee,
      },
    };
  };

  static addInputToPSBT = (
    PSBT: bitcoinJS.Psbt,
    wallet: Wallet,
    input: InputUTXOs,
    network: bitcoinJS.networks.Network,
    derivationPurpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT,
  ) => {
    const { publicKey, subPath } = WalletUtilities.addressToPublicKey(
      input.address,
      wallet,
    );

    if (derivationPurpose === DerivationPurpose.BIP86) {
      const p2tr = bitcoinJS.payments.p2tr({
        internalPubkey: WalletUtilities.toXOnly(publicKey),
        network,
      });
      PSBT.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: {
          script: p2tr.output,
          value: input.value,
        },
        tapInternalKey: WalletUtilities.toXOnly(publicKey),
      });
    }
  };

  static createTransaction = async (
    wallet: Wallet,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisite,
    scriptType?: BIP48ScriptTypes,
  ): Promise<{
    PSBT: bitcoinJS.Psbt;
    inputs: InputUTXOs[];
    outputs: OutputUTXOs[];
    change: string;
  }> => {
    try {
      let inputs;
      let outputs;
      if (txnPriority === TxPriority.CUSTOM) {
        // if (!customTxPrerequisites) {
        //   throw new Error('Tx-prerequisites missing for custom fee');
        // }
        inputs = txPrerequisites[txnPriority].inputs;
        outputs = txPrerequisites[txnPriority].outputs;
      } else {
        inputs = txPrerequisites[txnPriority].inputs;
        outputs = txPrerequisites[txnPriority].outputs;
      }

      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
        network,
      });

      let derivationPurpose;
      if (wallet.entityKind === EntityKind.WALLET) {
        derivationPurpose = WalletUtilities.getPurpose(
          (wallet as Wallet).derivationDetails.xDerivationPath,
        );
      }

      for (const input of inputs) {
        this.addInputToPSBT(
          PSBT,
          wallet,
          input,
          network,
          derivationPurpose,
          scriptType,
        );
      }

      const {
        outputs: outputsWithChange,
        changeAddress,
        changeMultisig,
      } = WalletUtilities.generateChange(
        wallet,
        outputs,
        wallet.specs.nextFreeChangeAddressIndex,
        network,
      );

      const change = changeAddress || changeMultisig?.address;
      outputsWithChange.sort((out1, out2) => {
        if (out1.address < out2.address) {
          return -1;
        }
        if (out1.address > out2.address) {
          return 1;
        }
        return 0;
      });

      for (const output of outputsWithChange) {
        PSBT.addOutput(output);
      }

      return {
        PSBT,
        inputs,
        outputs,
        change,
      };
    } catch (err) {
      throw new Error(`Transaction creation failed: ${err.message}`);
    }
  };

  static signTransaction = (
    wallet: Wallet,
    inputs: any,
    PSBT: bitcoinJS.Psbt,
  ): {
    signedPSBT: bitcoinJS.Psbt;
  } => {
    try {
      let vin = 0;

      for (const input of inputs) {
        let { keyPair } = WalletUtilities.addressToKeyPair(
          input.address,
          wallet,
        );
        const purpose = WalletUtilities.getPurpose(
          wallet.derivationDetails.xDerivationPath,
        );

        if (purpose === DerivationPurpose.BIP86) {
          // create a tweaked signer to sign P2TR tweaked key
          const tweakedSigner = keyPair.tweak(
            bitcoinJS.crypto.taggedHash(
              'TapTweak',
              WalletUtilities.toXOnly(keyPair.publicKey),
            ),
          );

          PSBT.signTaprootInput(vin, tweakedSigner);
        } else {
          PSBT.signInput(vin, keyPair);
        }

        vin++;
      }

      return {
        signedPSBT: PSBT,
      };
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  };

  static broadcastTransaction = async (
    wallet: Wallet,
    txHex: string,
    inputs: InputUTXOs[],
  ) => {
    const txid = await ElectrumClient.broadcast(txHex);

    if (!txid) {
      throw new Error('Failed to broadcast transaction, txid missing');
    }
    if (txid.includes('sendrawtransaction RPC error')) {
      let err;
      try {
        err = txid.split(':')[3].split('"')[1];
      } catch (err) {}
      throw new Error(err || txid);
    }

    WalletOperations.removeConsumedUTXOs(wallet, inputs); // chip consumed utxos
    return txid;
  };

  static transferST1 = async (
    wallet: Wallet,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
    selectedPriority: TxPriority,
    selectedUTXOs?: UTXO[],
  ): Promise<{
    txPrerequisites: TransactionPrerequisite;
  }> => {
    let outgoingAmount = 0;
    recipients = recipients.map(recipient => {
      recipient.amount = Math.round(recipient.amount);
      outgoingAmount += recipient.amount;
      return recipient;
    });
    let { fee, balance, txPrerequisites } =
      WalletOperations.prepareTransactionPrerequisites(
        wallet,
        recipients,
        averageTxFees,
        selectedPriority,
        selectedUTXOs,
      );
    if (balance < outgoingAmount + fee) {
      throw new Error('Insufficient balance');
    }
    if (Object.keys(txPrerequisites).length) {
      return { txPrerequisites };
    }

    throw new Error(
      'Unable to create transaction: inputs failed at coinselect',
    );
  };

  static transferST2 = async (
    wallet: Wallet,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    recipients: {
      address: string;
      amount: number;
    }[],
    customTxPrerequisites?: TransactionPrerequisite,
  ): Promise<
    | {
        serializedPSBTEnvelops: SerializedPSBTEnvelop[];
        cachedTxid: string;
        txid?;
        finalOutputs?: bitcoinJS.TxOutput[];
      }
    | {
        serializedPSBTEnvelop?;
        cachedTxid?;
        txid: string;
        finalOutputs: bitcoinJS.TxOutput[];
      }
  > => {
    const { PSBT, inputs, outputs, change } =
      await WalletOperations.createTransaction(
        wallet,
        txPrerequisites,
        txnPriority,
        customTxPrerequisites,
      );

    // case: wallet(single-sig)
    const { signedPSBT } = WalletOperations.signTransaction(
      wallet as Wallet,
      inputs,
      PSBT,
    );

    // validating signatures; contributes significantly to the transaction time(enable only if necessary)
    // const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs(validator);
    // if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

    // finalise and construct the txHex
    const tx = signedPSBT.finalizeAllInputs();
    const txHex = tx.extractTransaction().toHex();
    const finalOutputs = tx.txOutputs;

    const txid = await this.broadcastTransaction(wallet, txHex, inputs);

    return {
      txid,
      finalOutputs,
    };
  };

  static transferST3 = async (
    wallet: Wallet,
    serializedPSBTEnvelops: SerializedPSBTEnvelop[],
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    customTxPrerequisites?: TransactionPrerequisite,
    txHex?: string,
  ): Promise<{
    txid: string;
    finalOutputs: bitcoinJS.TxOutput[];
  }> => {
    let inputs;
    if (txnPriority === TxPriority.CUSTOM) {
      if (!customTxPrerequisites) {
        throw new Error('Tx-prerequisites missing for custom fee');
      }
      inputs = customTxPrerequisites[txnPriority].inputs;
    } else {
      inputs = txPrerequisites[txnPriority].inputs;
    }

    let combinedPSBT: bitcoinJS.Psbt = null;
    let finalOutputs: bitcoinJS.TxOutput[];

    if (!txHex) {
      // construct the txHex by combining the signed PSBTs
      for (const serializedPSBTEnvelop of serializedPSBTEnvelops) {
        const { signerType, serializedPSBT, signingPayload } =
          serializedPSBTEnvelop;
        const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, {
          network: config.NETWORK,
        });

        if (!combinedPSBT) {
          combinedPSBT = PSBT;
        } else {
          combinedPSBT.combine(PSBT);
        }
      }

      // validating signatures; contributes significantly to the transaction time(enable only if necessary)
      // const areSignaturesValid = combinedPSBT.validateSignaturesOfAllInputs(validator);
      // if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

      // finalise and construct the txHex
      const tx = combinedPSBT.finalizeAllInputs();
      finalOutputs = tx.txOutputs;
      txHex = tx.extractTransaction().toHex();
    }

    const txid = await this.broadcastTransaction(wallet, txHex, inputs);
    return {
      txid,
      finalOutputs,
    };
  };
}
