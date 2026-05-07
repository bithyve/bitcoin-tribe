/**
 * Utility to map raw RGB/SDK errors to user-friendly localized messages.
 *
 * Usage:
 *   import { getRgbErrorMessage } from 'src/utils/errorUtils';
 *   // inside a React component with LocalizationContext:
 *   const { translations } = useContext(LocalizationContext);
 *   Toast(getRgbErrorMessage(error, translations.common), true);
 */

type CommonTranslations = Record<string, string>;

/**
 * Returns a user-friendly, localized error message for a given error.
 * Recognises RGB SDK error codes and message patterns and maps them to
 * keys in `translations.common`.  Falls back to a generic message when
 * the error is unrecognised.
 *
 * @param error    - The caught error (unknown shape).
 * @param common   - The `translations.common` object from LocalizationContext.
 */
export function getRgbErrorMessage(
  error: unknown,
  common: CommonTranslations,
): string {
  const code: string = (error as any)?.code ?? '';
  const message: string =
    typeof error === 'string'
      ? error
      : (error as any)?.message ?? String(error);

  // ── IndexerError / connectivity ──────────────────────────────────────────
  if (
    code === 'InvalidIndexer' ||
    message.includes('InvalidIndexer') ||
    message.includes('not a valid electrum') ||
    message.includes('not a valid esplora') ||
    message.includes('ConnectionRefused') ||
    message.includes('electrum') ||
    message.includes('esplora')
  ) {
    return common.errorInvalidIndexer ?? message;
  }

  // ── Insufficient bitcoin (on-chain sats) ─────────────────────────────────
  if (
    code === 'InsufficientBitcoins' ||
    message.includes('InsufficientBitcoins') ||
    message.includes('needed=') ||
    message.includes('available=0') ||
    message.includes('Insufficient sats for RGB') ||
    message.includes('Insufficient sats in the main')
  ) {
    return common.errorInsufficientBitcoins ?? message;
  }

  // ── No allocation slots / UTXOs ──────────────────────────────────────────
  if (
    code === 'InsufficientAllocationSlots' ||
    message.includes('InsufficientAllocationSlots') ||
    code === 'NoAvailableUtxos' ||
    message.includes('NoAvailableUtxos')
  ) {
    return common.errorInsufficientAllocationSlots ?? message;
  }

  // ── Asset not found ──────────────────────────────────────────────────────
  if (code === 'AssetNotFound' || message.includes('AssetNotFound')) {
    return common.errorAssetNotFound ?? message;
  }

  // ── Network / timeout ────────────────────────────────────────────────────
  if (
    message.includes('Network request failed') ||
    message.includes('timeout') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT')
  ) {
    return common.errorNetworkFailed ?? message;
  }

  // ── Generic RgbLibError (catch-all for unparsed SDK errors) ─────────────
  if (message.includes('RgbLibError') || message.includes('tribe.RgbLib')) {
    return common.errorGenericRgb ?? message;
  }

  // ── Unknown / unrecognised error ─────────────────────────────────────────
  return common.errorUnknown ?? message;
}
