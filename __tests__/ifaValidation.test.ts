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

  it('accepts zero amendments', () => {
    expect(isIfaAmendmentsValid('0')).toBe(true);
  });

  it('rejects blank amendments', () => {
    expect(isIfaAmendmentsValid('')).toBe(false);
  });

  it('sanitizes numeric input', () => {
    expect(sanitizeNumericInput('a1,2-3')).toBe('123');
  });
});
