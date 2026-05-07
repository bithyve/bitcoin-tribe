import {
  isIfaAmendmentsValid,
  isIfaTotalSupplyValid,
  sanitizeNumericInput,
} from 'src/screens/collectiblesCoins/utils/ifaValidation';

describe('ifaValidation', () => {
  it('marks total supply as invalid when it is zero', () => {
    expect(isIfaTotalSupplyValid('0', 0)).toBe(false);
  });

  it('marks total supply as valid when it is greater than zero', () => {
    expect(isIfaTotalSupplyValid('1', 0)).toBe(true);
  });

  it('accepts total supply exactly at max boundary when precision is zero', () => {
    expect(isIfaTotalSupplyValid('18446744073709551615', 0)).toBe(true);
  });

  it('rejects total supply when value exceeds max after precision scaling', () => {
    expect(isIfaTotalSupplyValid('18446744073709551615', 1)).toBe(false);
  });

  it('accepts zero amendments', () => {
    expect(isIfaAmendmentsValid('0')).toBe(true);
  });

  it('rejects blank amendments', () => {
    expect(isIfaAmendmentsValid('')).toBe(false);
  });

  it('sanitizes numeric input', () => {
    expect(sanitizeNumericInput('a1,2-3')).toBe('123');
  });

  it('rejects comma-only supply input', () => {
    expect(isIfaTotalSupplyValid(',,', 0)).toBe(false);
  });
});
