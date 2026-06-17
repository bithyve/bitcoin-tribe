import { isSessionExpired, shouldEnforceSessionLock, SESSION_TIMEOUT_MS } from '../src/utils/sessionUtils';
import PinMethod from '../src/models/enums/PinMethod';

describe('isSessionExpired', () => {
  it('returns false when elapsed time is less than SESSION_TIMEOUT_MS', () => {
    const recentTs = Date.now() - SESSION_TIMEOUT_MS + 10_000; // 10 seconds before timeout
    expect(isSessionExpired(recentTs)).toBe(false);
  });

  it('returns true when elapsed time equals SESSION_TIMEOUT_MS', () => {
    const exactTs = Date.now() - SESSION_TIMEOUT_MS;
    expect(isSessionExpired(exactTs)).toBe(true);
  });

  it('returns true when elapsed time exceeds SESSION_TIMEOUT_MS', () => {
    const oldTs = Date.now() - SESSION_TIMEOUT_MS - 60_000; // 1 minute past timeout
    expect(isSessionExpired(oldTs)).toBe(true);
  });

  it('returns false for a timestamp only 1 second old', () => {
    const ts = Date.now() - 1_000;
    expect(isSessionExpired(ts)).toBe(false);
  });
});

describe('shouldEnforceSessionLock', () => {
  it('returns false for PinMethod.DEFAULT', () => {
    expect(shouldEnforceSessionLock(PinMethod.DEFAULT)).toBe(false);
  });

  it('returns false for undefined pin method', () => {
    expect(shouldEnforceSessionLock(undefined)).toBe(false);
  });

  it('returns true for PinMethod.PIN', () => {
    expect(shouldEnforceSessionLock(PinMethod.PIN)).toBe(true);
  });

  it('returns true for PinMethod.BIOMETRIC', () => {
    expect(shouldEnforceSessionLock(PinMethod.BIOMETRIC)).toBe(true);
  });
});
