/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bitcoinJS from 'bitcoinjs-lib';

import ECPairFactory from 'ecpair';
import coinselect from 'coinselect';
import coinselectSplit from 'coinselect/split';
import config from 'src/utils/config';
import { parseInt } from 'lodash';
import ElectrumClient from 'src/services/electrum/client';
// import { isSignerAMF } from 'src/hardware';
import idx from 'idx';
import RestClient, { TorStatus } from 'src/services/rest/RestClient';
import ecc from './taproot-utils/noble_ecc';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  Balances,
  InputUTXOs,
  OutputUTXOs,
  SerializedPSBTEnvelop,
  SigningPayload,
  Transaction,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
  UTXO,
} from '../interfaces';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerType,
  TransactionType,
  TxPriority,
} from '../enums';
import { Signer, Vault, VaultSigner, VaultSpecs } from '../interfaces/vault';
import {
  AddressCache,
  AddressPubs,
  Wallet,
  WalletSpecs,
} from '../interfaces/wallet';
import WalletUtilities from './utils';
import { hash256 } from 'src/utils/encryption';

bitcoinJS.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

const TESTNET_FEE_CUTOFF = 10;

const testnetFeeSurcharge = (wallet: Wallet | Vault) =>
  /* !! TESTNET ONLY !!
     as the redeem script for vault is heavy(esp. 3-of-5/3-of-6),
     the nodes reject the tx if the overall fee for the tx is low(which is the case w/ electrum)
     therefore we up the feeRatesPerByte by 1 to handle this case until we find a better sol
    */
  config.NETWORK_TYPE === NetworkType.TESTNET &&
  wallet.entityKind === EntityKind.VAULT
    ? 1
    : 0;

export default class WalletOperations {
  public static getNextFreeExternalAddress = (
    wallet: Wallet | Vault,
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

    if ((wallet as Vault).isMultiSig) {
      // case: multi-sig vault
      receivingAddress = WalletUtilities.createMultiSig(
        wallet as Vault,
        specs.nextFreeAddressIndex,
        false,
      ).address;
    } else {
      // case: single-sig vault/wallet
      const xpub =
        entityKind === EntityKind.VAULT
          ? (specs as VaultSpecs).xpubs[0]
          : (specs as WalletSpecs).xpub;
      const derivationPath = (wallet as Wallet)?.derivationDetails
        ?.xDerivationPath;

      const purpose =
        entityKind === EntityKind.VAULT
          ? undefined
          : WalletUtilities.getPurpose(derivationPath);

      receivingAddress = WalletUtilities.getAddressByIndex(
        xpub,
        false,
        specs.nextFreeAddressIndex,
        network,
        purpose,
      );
    }

    return {
      receivingAddress,
    };
  };

  public static getNextFreeChangeAddress = (
    wallet: Wallet | Vault,
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

    if ((wallet as Vault).isMultiSig) {
      // case: multi-sig vault
      changeAddress = WalletUtilities.createMultiSig(
        wallet as Vault,
        specs.nextFreeChangeAddressIndex,
        true,
      ).address;
    } else {
      // case: single-sig vault/wallet
      const xpub =
        entityKind === EntityKind.VAULT
          ? (specs as VaultSpecs).xpubs[0]
          : (specs as WalletSpecs).xpub;
      const derivationPath = (wallet as Wallet)?.derivationDetails
        ?.xDerivationPath;

      const purpose =
        entityKind === EntityKind.VAULT
          ? undefined
          : WalletUtilities.getPurpose(derivationPath);

      changeAddress = WalletUtilities.getAddressByIndex(
        xpub,
        true,
        specs.nextFreeChangeAddressIndex,
        network,
        purpose,
      );
    }

    return {
      changeAddress,
    };
  };

  static getNextFreeAddress = (wallet: Wallet | Vault) => {
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
    };
    return transaction;
  };

  static fetchTransactions = async (
    wallet: Wallet | Vault,
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
    wallets: (Wallet | Vault)[],
    network: bitcoinJS.networks.Network,
  ): Promise<{
    synchedWallets: (Wallet | Vault)[];
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
          if ((wallet as Vault).isMultiSig) {
            const multisig = WalletUtilities.createMultiSig(
              wallet as Vault,
              itr,
              false,
            );
            address = multisig.address;
            pubsToCache = multisig.orderPreservedPubkeys;
          } else {
            let xpub = null;
            if (wallet.entityKind === EntityKind.VAULT) {
              xpub = (wallet as Vault).specs.xpubs[0];
            } else {
              xpub = (wallet as Wallet).specs.xpub;
            }

            const singlesig = WalletUtilities.getAddressAndPubByIndex(
              xpub,
              false,
              itr,
              network,
              purpose,
            );
            address = singlesig.address;
            pubsToCache = [singlesig.pub];
          }

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
          if ((wallet as Vault).isMultiSig) {
            const multisig = WalletUtilities.createMultiSig(
              wallet as Vault,
              itr,
              true,
            );
            address = multisig.address;
            pubsToCache = multisig.orderPreservedPubkeys;
          } else {
            let xpub = null;
            if (wallet.entityKind === EntityKind.VAULT) {
              xpub = (wallet as Vault).specs.xpubs[0];
            } else {
              xpub = (wallet as Wallet).specs.xpub;
            }

            const singlesig = WalletUtilities.getAddressAndPubByIndex(
              xpub,
              true,
              itr,
              network,
              purpose,
            );
            address = singlesig.address;
            pubsToCache = [singlesig.pub];
          }

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

  static removeConsumedUTXOs = (
    wallet: Wallet | Vault,
    inputs: InputUTXOs[],
  ) => {
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
      feePerByte: 3,
      estimatedBlocks: highFeeBlockEstimate,
      averageTxFee: 3,
    };

    // medium fee: 30 mins
    const mediumFeeBlockEstimate = 1;
    const medium = {
      feePerByte: 2,
      estimatedBlocks: mediumFeeBlockEstimate,
      averageTxFee: 2,
    };

    // low fee: 60 mins
    const lowFeeBlockEstimate = 1;
    const low = {
      feePerByte: 1,
      estimatedBlocks: lowFeeBlockEstimate,
      averageTxFee: 1,
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
        endpoint =
          RestClient.getTorStatus() === TorStatus.CONNECTED
            ? 'http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/api/v1/fees/recommended'
            : 'https://mempool.space/api/v1/fees/recommended';
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
    wallet: Wallet | Vault,
    numberOfRecipients: number,
    feePerByte: number,
    network: bitcoinJS.networks.Network,
    selectedUTXOs?: UTXO[],
  ): { fee: number } => {
    const inputUTXOs =
      selectedUTXOs && selectedUTXOs.length
        ? selectedUTXOs
        : [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    let confirmedBalance = 0;
    inputUTXOs.forEach(utxo => {
      confirmedBalance += utxo.value;
    });

    const outputUTXOs = [];
    for (let index = 0; index < numberOfRecipients; index++) {
      // using random outputs for send all fee calculation
      outputUTXOs.push({
        address: bitcoinJS.payments.p2sh({
          redeem: bitcoinJS.payments.p2wpkh({
            pubkey: ECPair.makeRandom().publicKey,
            network,
          }),
          network,
        }).address,
      });
    }
    const { fee } = coinselectSplit(
      inputUTXOs,
      outputUTXOs,
      feePerByte + testnetFeeSurcharge(wallet),
    );

    return {
      fee,
    };
  };

  static prepareTransactionPrerequisites = (
    wallet: Wallet | Vault,
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
    wallet: Wallet | Vault,
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
    wallet: Wallet | Vault,
    input: InputUTXOs,
    network: bitcoinJS.networks.Network,
    derivationPurpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT,
  ) => {
    const { isMultiSig } = wallet as Vault;
    if (!isMultiSig) {
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
      } else {
        let path;
        let masterFingerprint;
        if (wallet.entityKind === EntityKind.VAULT) {
          const signer = (wallet as Vault).signers[0];
          const { derivationPath, masterFingerprint: mfp } = signer;
          path = `${derivationPath}/${subPath.join('/')}`;
          masterFingerprint = mfp;
        } else {
          path = `${
            (wallet as Wallet).derivationDetails.xDerivationPath
          }/${subPath.join('/')}`;
          masterFingerprint = WalletUtilities.getMasterFingerprintForWallet(
            wallet as Wallet,
          );
        }
        const bip32Derivation = [
          {
            masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
            path: path.replaceAll('h', "'"),
            pubkey: publicKey,
          },
        ];

        const p2wpkh = bitcoinJS.payments.p2wpkh({
          pubkey: publicKey,
          network,
        });

        if (derivationPurpose === DerivationPurpose.BIP84) {
          PSBT.addInput({
            hash: input.txId,
            index: input.vout,
            bip32Derivation,
            witnessUtxo: {
              script: p2wpkh.output,
              value: input.value,
            },
          });
        } else if (derivationPurpose === DerivationPurpose.BIP49) {
          const p2sh = bitcoinJS.payments.p2sh({
            redeem: p2wpkh,
          });

          PSBT.addInput({
            hash: input.txId,
            index: input.vout,
            bip32Derivation,
            witnessUtxo: {
              script: p2sh.output,
              value: input.value,
            },
            redeemScript: p2wpkh.output,
          });
        }
      }
    } else {
      const { p2ms, p2wsh, p2sh, subPath, signerPubkeyMap } =
        WalletUtilities.addressToMultiSig(input.address, wallet as Vault);

      const bip32Derivation = [];
      for (const signer of (wallet as Vault).signers) {
        const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
        const path = `${signer.derivationPath}/${subPath.join('/')}`;
        bip32Derivation.push({
          masterFingerprint,
          path: (path as any).replaceAll('h', "'"),
          pubkey: signerPubkeyMap.get(signer.xpub),
        });
      }

      if (scriptType === BIP48ScriptTypes.NATIVE_SEGWIT) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2wsh.output,
            value: input.value,
          },
          witnessScript: p2ms.output,
        });
      } else if (scriptType === BIP48ScriptTypes.WRAPPED_SEGWIT) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2sh.output,
            value: input.value,
          },
          redeemScript: p2wsh.output,
          witnessScript: p2ms.output,
        });
      }
    }
  };

  static getPSBTDataForChangeOutput = (
    wallet: Vault,
    changeMultiSig: {
      p2ms: bitcoinJS.payments.Payment;
      p2wsh: bitcoinJS.payments.Payment;
      p2sh: bitcoinJS.payments.Payment;
      pubkeys: Buffer[];
      address: string;
      subPath: number[];
      signerPubkeyMap: Map<string, Buffer>;
    },
  ): {
    bip32Derivation: any[];
    redeemScript: Buffer;
    witnessScript: Buffer;
  } => {
    const bip32Derivation = []; // array per each pubkey thats gona be used
    const { subPath, p2wsh, p2ms, signerPubkeyMap } = changeMultiSig;
    for (const signer of wallet.signers) {
      const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
      const path = `${signer.derivationPath}/${subPath.join('/')}`;
      bip32Derivation.push({
        masterFingerprint,
        path,
        pubkey: signerPubkeyMap.get(signer.xpub),
      });
    }
    return {
      bip32Derivation,
      redeemScript: p2wsh.output,
      witnessScript: p2ms.output,
    };
  };

  static createTransaction = async (
    wallet: Wallet | Vault,
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
        if (!customTxPrerequisites) {
          throw new Error('Tx-prerequisites missing for custom fee');
        }
        inputs = customTxPrerequisites[txnPriority].inputs;
        outputs = customTxPrerequisites[txnPriority].outputs;
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
        if (
          wallet.entityKind === EntityKind.VAULT &&
          (wallet as Vault).isMultiSig &&
          output.address === changeMultisig?.address
        ) {
          // case: change output for multisig Vault
          const { bip32Derivation, witnessScript, redeemScript } =
            WalletOperations.getPSBTDataForChangeOutput(
              wallet as Vault,
              changeMultisig,
            );
          PSBT.addOutput({
            ...output,
            bip32Derivation,
            witnessScript,
            redeemScript,
          });
        } else if (
          wallet.entityKind === EntityKind.VAULT &&
          !(wallet as Vault).isMultiSig &&
          output.address === changeAddress
        ) {
          // case: change output for single-sig Vault(p2wpkh)
          const { publicKey, subPath } = WalletUtilities.addressToPublicKey(
            changeAddress,
            wallet,
          );
          const signer = (wallet as Vault).signers[0];
          const masterFingerprint = Buffer.from(
            signer.masterFingerprint,
            'hex',
          );
          const path = `${signer.derivationPath}/${subPath.join('/')}`;
          const bip32Derivation = [
            {
              masterFingerprint,
              path,
              pubkey: publicKey,
            },
          ];

          PSBT.addOutput({ ...output, bip32Derivation });
        } else {
          PSBT.addOutput(output);
        }
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

  static internallySignVaultPSBT = (
    wallet: Vault,
    inputs: any,
    serializedPSBT: string,
    xpriv: string,
  ): { signedSerializedPSBT: string } => {
    try {
      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, {
        network: config.NETWORK,
      });

      let vin = 0;
      for (const input of inputs) {
        let internal;
        let index;
        if (input.subPath) {
          const [, j, k] = input.subPath.split('/');
          internal = parseInt(j);
          index = parseInt(k);
        } else {
          const { subPath } = WalletUtilities.getSubPathForAddress(
            input.address,
            wallet,
          );
          [internal, index] = subPath;
        }

        const keyPair = WalletUtilities.getKeyPairByIndex(
          xpriv,
          !!internal,
          index,
          network,
        );
        PSBT.signInput(vin, keyPair);
        vin++;
      }

      return { signedSerializedPSBT: PSBT.toBase64() };
    } catch (err) {
      console.log(err);
    }
  };

  static signVaultTransaction = (
    wallet: Vault,
    inputs: InputUTXOs[],
    PSBT: bitcoinJS.Psbt,
    vaultKey: VaultSigner,
    outgoing: number,
    outputs: OutputUTXOs[],
    change: string,
    signerMap?: { [key: string]: Signer },
  ):
    | {
        signedPSBT: bitcoinJS.Psbt;
        serializedPSBTEnvelop?;
      }
    | {
        signedPSBT?;
        serializedPSBTEnvelop: SerializedPSBTEnvelop;
      } => {
    const signingPayload: SigningPayload[] = [];
    const signer = signerMap[vaultKey.masterFingerprint];
    const payloadTarget = signer.type;
    let isSigned = false;
    if (signer.isMock && vaultKey.xpriv) {
      // case: if the signer is mock and has an xpriv attached to it, we'll sign the PSBT right away
      const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
        wallet,
        inputs,
        PSBT.toBase64(),
        vaultKey.xpriv,
      );
      PSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT, {
        network: config.NETWORK,
      });
      isSigned = true;
    } else if (
      signer.type === SignerType.TAPSIGNER || // replaced (signer.type === SignerType.TAPSIGNER && !isSignerAMF(signer)) w/ signer.type === SignerType.TAPSIGNER
      signer.type === SignerType.LEDGER ||
      signer.type === SignerType.TREZOR ||
      signer.type === SignerType.BITBOX02
    ) {
      const inputsToSign = [];
      for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        let publicKey;
        let subPath;
        if (wallet.isMultiSig) {
          const multisigAddress = WalletUtilities.addressToMultiSig(
            inputs[inputIndex].address,
            wallet,
          );
          publicKey = multisigAddress.signerPubkeyMap.get(vaultKey.xpub);
          subPath = multisigAddress.subPath;
        } else {
          const singlesigAddress = WalletUtilities.addressToPublicKey(
            inputs[inputIndex].address,
            wallet,
          );
          publicKey = singlesigAddress.publicKey;
          subPath = singlesigAddress.subPath;
        }
        const { hash, sighashType } = PSBT.getDigestToSign(
          inputIndex,
          publicKey,
        );
        inputsToSign.push({
          digest: hash.toString('hex'),
          subPath: `/${subPath.join('/')}`,
          inputIndex,
          sighashType,
          publicKey: publicKey.toString('hex'),
        });
      }
      signingPayload.push({
        payloadTarget,
        inputsToSign,
        inputs,
        outputs,
        change,
      });
    } else if (
      signer.type === SignerType.MOBILE_KEY ||
      signer.type === SignerType.SEED_WORDS
    ) {
      signingPayload.push({ payloadTarget, inputs });
    } else if (
      signer.type === SignerType.POLICY_SERVER ||
      signer.type === SignerType.INHERITANCEKEY
    ) {
      const childIndexArray = [];
      for (const input of inputs) {
        const { subPath } = WalletUtilities.getSubPathForAddress(
          input.address,
          wallet,
        );
        childIndexArray.push({
          subPath,
          inputIdentifier: {
            txId: input.txId,
            vout: input.vout,
            value: input.value,
          },
        });
      }
      signingPayload.push({ payloadTarget, childIndexArray, outgoing });
    }

    // if (isSignerAMF(signer)) {
    //   signingPayload.push({ payloadTarget, inputs });
    // }

    const serializedPSBT = PSBT.toBase64();
    const serializedPSBTEnvelop: SerializedPSBTEnvelop = {
      xfp: vaultKey.xfp,
      signerType: signer.type,
      serializedPSBT,
      signingPayload,
      isSigned,
    };
    return { serializedPSBTEnvelop };
  };

  static broadcastTransaction = async (
    wallet: Wallet | Vault,
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
    wallet: Wallet | Vault,
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
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    recipients: {
      address: string;
      amount: number;
    }[],
    customTxPrerequisites?: TransactionPrerequisite,
    signerMap?: { [key: string]: Signer },
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

    if (wallet.entityKind === EntityKind.VAULT) {
      // case: vault(single/multi-sig)
      const { signers: vaultKeys } = wallet as Vault;
      const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = [];
      let outgoing = 0;
      recipients.forEach(recipient => {
        outgoing += recipient.amount;
      });

      for (const vaultKey of vaultKeys) {
        const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
          wallet as Vault,
          inputs,
          PSBT,
          vaultKey,
          outgoing,
          outputs,
          change,
          signerMap,
        );
        serializedPSBTEnvelops.push(serializedPSBTEnvelop);
      }

      return { serializedPSBTEnvelops, cachedTxid: hash256(PSBT.toBase64()) };
    } else {
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
    }
  };

  static transferST3 = async (
    wallet: Wallet | Vault,
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
        if (
          signerType === SignerType.TAPSIGNER &&
          config.NETWORK_TYPE === NetworkType.MAINNET
        ) {
          for (const { inputsToSign } of signingPayload) {
            for (const {
              inputIndex,
              publicKey,
              signature,
              sighashType,
            } of inputsToSign) {
              if (signature) {
                PSBT.addSignedDigest(
                  inputIndex,
                  Buffer.from(publicKey, 'hex'),
                  Buffer.from(signature, 'hex'),
                  sighashType,
                );
              }
            }
          }
        }

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
