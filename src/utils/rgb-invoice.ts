/**
 * RGB invoice amount encoding + embedding.
 *
 * Ported from Orbis reference implementation and aligned to rgbinvoice::Amount
 * display encoding:
 * - raw u64 (smallest units) -> LE bytes -> trim trailing zeros -> base32 (nodigit alphabet)
 * - embed by replacing the 3rd path component of `rgb:` invoice (index 2)
 */
 
const BASE32_NODIGIT = 'abcdefghkmnABCDEFGHKMNPQRSTVWXYZ';
 
function assertU64(raw: bigint) {
  if (raw < 0n) throw new Error('RGB invoice amount must be non-negative');
  // u64 max
  if (raw > 18446744073709551615n) {
    throw new Error('RGB invoice amount exceeds u64');
  }
}
 
function base32EncodeNoDigit(data: Uint8Array): string {
  const alphabet = BASE32_NODIGIT;
  let result = '';
 
  for (let i = 0; i < data.length; i += 5) {
    const slice = data.subarray(i, Math.min(i + 5, data.length));
    const pad = 5 - slice.length;
    const b0 = slice[0] ?? 0;
    const b1 = slice[1] ?? 0;
    const b2 = slice[2] ?? 0;
    const b3 = slice[3] ?? 0;
    const b4 = slice[4] ?? 0;
 
    const c0 = (b0 >> 3) & 0x1f;
    const c1 = ((b0 << 2) | (b1 >> 6)) & 0x1f;
    const c2 = (b1 >> 1) & 0x1f;
    const c3 = ((b1 << 4) | (b2 >> 4)) & 0x1f;
    const c4 = ((b2 << 1) | (b3 >> 7)) & 0x1f;
    const c5 = (b3 >> 2) & 0x1f;
    const c6 = ((b3 << 3) | (b4 >> 5)) & 0x1f;
    const c7 = b4 & 0x1f;
 
    result +=
      alphabet[c0] +
      alphabet[c1] +
      alphabet[c2] +
      alphabet[c3] +
      alphabet[c4] +
      alphabet[c5] +
      alphabet[c6] +
      alphabet[c7];
 
    if (pad > 0) {
      const padChars = Math.floor((pad * 8) / 5);
      result = result.slice(0, -padChars);
    }
  }
 
  return result;
}
 
function pow10(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) throw new Error('precision must be >= 0');
  let r = 1n;
  for (let i = 0; i < n; i += 1) r *= 10n;
  return r;
}
 
/**
 * Convert a decimal string amount into smallest units (raw integer) using precision.
 * Example: ("1.23", 2) -> 123n
 */
export function decimalStringToSmallestUnits(
  amount: string,
  precision: number,
): bigint {
  const p = precision ?? 0;
  if (!Number.isInteger(p) || p < 0) {
    throw new Error('decimalStringToSmallestUnits: invalid precision');
  }
 
  const normalized = (amount ?? '').replace(/\s/g, '').replace(/,/g, '.');
  if (normalized === '') return 0n;
  if (normalized.startsWith('-')) {
    throw new Error('decimalStringToSmallestUnits: amount must be non-negative');
  }
 
  const parts = normalized.split('.');
  if (parts.length > 2) {
    throw new Error('decimalStringToSmallestUnits: invalid decimal format');
  }
  const wholeStr = parts[0] === '' ? '0' : parts[0];
  const fracStr = parts[1] ?? '';
 
  if (!/^\d+$/.test(wholeStr) || (fracStr !== '' && !/^\d+$/.test(fracStr))) {
    throw new Error('decimalStringToSmallestUnits: invalid digits');
  }
  if (fracStr.length > p) {
    throw new Error('decimalStringToSmallestUnits: too many decimals');
  }
 
  const whole = BigInt(wholeStr);
  const fracPadded = (fracStr + '0'.repeat(p)).slice(0, p);
  const frac = fracPadded === '' ? 0n : BigInt(fracPadded);
 
  return whole * pow10(p) + frac;
}
 
/**
 * Encodes raw smallest-units amount into the RGB invoice amount string.
 * raw u64 -> little-endian bytes -> trim trailing zeros -> base32 nodigit
 */
export function encodeRgbInvoiceAmountFromSmallestUnits(raw: bigint): string {
  assertU64(raw);
 
  // u64 to little-endian bytes
  const buf = new Uint8Array(8);
  let x = raw;
  for (let i = 0; i < 8; i += 1) {
    buf[i] = Number(x & 0xffn);
    x >>= 8n;
  }
 
  // Trim trailing zeros (keep at least 1 byte)
  let pos = buf.length;
  for (let i = buf.length - 1; i >= 0; i -= 1) {
    if (buf[i] !== 0) {
      pos = i + 1;
      break;
    }
    if (i === 0) pos = 1;
  }
 
  return base32EncodeNoDigit(buf.subarray(0, pos));
}
 
function parseRgbInvoice(invoice: string): { pathParts: string[]; query: string } {
  if (!invoice?.startsWith('rgb:')) {
    throw new Error('updateRgbInvoiceAmount: invalid RGB invoice format');
  }
  const rest = invoice.slice(4);
  const [path, query] = rest.includes('?') ? rest.split('?', 2) : [rest, ''];
  const pathParts = path.split('/').filter(p => p.length > 0);
  if (pathParts.length < 4) {
    throw new Error('updateRgbInvoiceAmount: invalid RGB invoice path');
  }
  return { pathParts, query };
}
 
/**
 * Updates the amount segment (assignment state) in an RGB invoice string.
 * Preserves contract, schema, beneficiary, and query params.
 */
export function updateRgbInvoiceAmount(
  invoice: string,
  rawSmallestUnits: bigint,
): string {
  const { pathParts, query } = parseRgbInvoice(invoice);
  const encoded = encodeRgbInvoiceAmountFromSmallestUnits(rawSmallestUnits);
  pathParts[2] = encoded;
  const base = `rgb:${pathParts.join('/')}`;
  return query ? `${base}?${query}` : base;
}

