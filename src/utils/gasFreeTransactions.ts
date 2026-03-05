/**
 * Gas-Free Transaction Metadata Storage
 * 
 * Stores metadata about gas-free transactions to help identify and group them in the UI
 * Uses a map structure for O(1) lookup performance
 */

import { Storage, Keys } from 'src/storage';
import { Transfer, TransferKind } from 'src/models/interfaces/RGBWallet';

export interface GasFreeTransactionMetadata {
  txid: string;
  assetId: string;
  recipientAmount: number;
  recipientInvoice: string;
  timestamp: number;
  feeQuote: {
    quoteId: string;
    serviceFeeAmount: number;
    serviceFeeInvoice: string;
    serviceFeeRecipientId: string;
    miningFeeSats: number;
    feeRateSatPerVByte: number;
    serviceFeePercentage: number;
    expiresAt: string;
    createdAt: string;
  };
}

// Map structure for O(1) lookups: { [txid]: GasFreeTransactionMetadata }
type GasFreeTransactionMap = Record<string, GasFreeTransactionMetadata>;

/**
 * Get gas-free transaction map (internal use for O(1) lookups)
 */
const getGasFreeTransactionsMap = (): GasFreeTransactionMap => {
  try {
    const data = Storage.get(Keys.GAS_FREE_TRANSACTIONS);
    if (!data || typeof data !== 'string') return {};
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get gas-free transactions map:', error);
    return {};
  }
};

/**
 * Save gas-free transaction metadata (O(1) operation)
 */
export const saveGasFreeTransaction = (metadata: GasFreeTransactionMetadata): void => {
  try {
    const map = getGasFreeTransactionsMap();
    map[metadata.txid] = metadata;
    
    Storage.set(Keys.GAS_FREE_TRANSACTIONS, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save gas-free transaction metadata:', error);
  }
};

/**
 * Get all gas-free transaction metadata as array
 */
export const getGasFreeTransactions = (): GasFreeTransactionMetadata[] => {
  const map = getGasFreeTransactionsMap();
  return Object.values(map);
};

/**
 * Check if a transaction is a gas-free transaction (O(1) lookup)
 */
export const isGasFreeTransaction = (txid: string): GasFreeTransactionMetadata | null => {
  const map = getGasFreeTransactionsMap();
  return map[txid] || null;
};

/**
 * Get gas-free transaction metadata by txid (O(1) lookup)
 */
export const getGasFreeTransactionByTxid = (txid: string): GasFreeTransactionMetadata | null => {
  return isGasFreeTransaction(txid);
};

/**
 * Filter duplicate transfers from gas-free transactions
 * 
 * For gas-free transactions, there are two transfers with the same txid:
 * 1. One to the recipient (main transfer)
 * 2. One to the service (service fee)
 * 
 * This function keeps only the main transfer (to recipient) and adds service fee metadata to it
 * Now uses O(1) lookups via the map structure
 */
export const filterGasFreeTransfers = (transfers: Transfer[]): Transfer[] => {
  const gasFreeMap = getGasFreeTransactionsMap();
  const processedTxids = new Set<string>();
  const filtered: Transfer[] = [];

  for (const transfer of transfers) {
    if (!transfer.txid) {
      filtered.push(transfer);
      continue;
    }

    // Check if this is a gas-free transaction (O(1) lookup)
    const metadata = gasFreeMap[transfer.txid];
    
    if (!metadata) {
      // Not a gas-free transaction, include as-is
      filtered.push(transfer);
      continue;
    }

    // If we've already processed this txid, skip it (it's the service fee transfer)
    if (processedTxids.has(transfer.txid)) {
      continue;
    }

    // Mark this txid as processed
    processedTxids.add(transfer.txid);

    // Add the transfer with gas-free metadata
    // We identify the main transfer as the SEND transfer (not to the service)
    if (transfer.kind === TransferKind.SEND) {
      filtered.push({
        ...transfer,
        // Add custom fields to indicate this is gas-free with complete fee info
        isGasFree: true,
        gasFreeMetadata: metadata,
      } as any); // Cast to any to allow custom fields
    }
  }

  return filtered;
};
