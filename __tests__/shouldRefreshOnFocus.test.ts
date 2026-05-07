import shouldRefreshOnFocus from '../src/screens/wallet/utils/shouldRefreshOnFocus';

describe('shouldRefreshOnFocus', () => {
  it('returns true when focused and autoRefresh is undefined', () => {
    expect(shouldRefreshOnFocus(undefined, true)).toBe(true);
  });

  it('returns true when focused and autoRefresh is true', () => {
    expect(shouldRefreshOnFocus(true, true)).toBe(true);
  });

  it('returns false when focused and autoRefresh is false', () => {
    expect(shouldRefreshOnFocus(false, true)).toBe(false);
  });

  it('returns false when screen is not focused', () => {
    expect(shouldRefreshOnFocus(undefined, false)).toBe(false);
    expect(shouldRefreshOnFocus(true, false)).toBe(false);
  });
});
