import { translations } from 'src/contexts/LocalizationContext';

/**
 * Maps raw RGB/technical error messages to user-friendly localized messages.
 *
 * Centralizes error handling so that raw SDK errors are never shown directly to users.
 * Always call this before passing an error message to Toast().
 */
export function getRgbErrorMessage(error: unknown): string {
  const { common } = translations;

  if (!error) {
    return common.errorUnknown;
  }

  const raw = typeof error === 'string' ? error : `${error}`;

  // Indexer / connectivity errors
  if (
    raw.includes('InvalidIndexer') ||
    raw.includes('not a valid electrum') ||
    raw.includes('not a valid electrum nor esplora') ||
    raw.includes('esplora server')
  ) {
    return common.errorInvalidIndexer;
  }

  // Insufficient bitcoin / UTXO funds
  if (
    raw.includes('InsufficientBitcoins') ||
    raw.includes('Insufficient sats for RGB') ||
    (raw.includes('needed=') && raw.includes('available='))
  ) {
    return common.errorInsufficientBitcoins;
  }

  // No UTXO allocation slots
  if (raw.includes('InsufficientAllocationSlots')) {
    return common.errorInsufficientAllocationSlots;
  }

  // UTXO not found / sync issues
  if (
    raw.includes('UTXO not found') ||
    raw.includes('UTXO not found in the internal database')
  ) {
    return common.errorUtxoNotFound;
  }

  // OAuth / OpenID auth errors (e.g. org.openid.appauth.general error -3)
  if (
    raw.includes('org.openid.appauth') ||
    raw.includes('appauth.general') ||
    raw.includes("The operation couldn't be completed")
  ) {
    return common.errorAuthFailed;
  }

  // General RGB lib errors – catch-all for any tribe.RgbLibError.* pattern
  if (raw.includes('RgbLibError') || raw.includes('tribe.Rgb')) {
    return common.errorRgbGeneral;
  }

  // Wallet sync required
  if (raw.includes('wallet is offline') || raw.includes('WalletOffline')) {
    return common.errorInvalidIndexer;
  }

  return common.errorUnknown;
}
