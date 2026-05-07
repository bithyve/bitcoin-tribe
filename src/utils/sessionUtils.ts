import PinMethod from 'src/models/enums/PinMethod';

export const SESSION_TIMEOUT_MS = 300_000; // 5 minutes

/**
 * Returns true when the elapsed time since the app was backgrounded
 * is greater than or equal to SESSION_TIMEOUT_MS.
 */
export function isSessionExpired(backgroundTs: number): boolean {
  return Date.now() - backgroundTs >= SESSION_TIMEOUT_MS;
}

/**
 * Returns true when the active pin method requires re-authentication
 * (i.e. PIN or BIOMETRIC). Users with DEFAULT (no PIN) are excluded.
 */
export function shouldEnforceSessionLock(
  pinMethod: string | undefined,
): boolean {
  return pinMethod === PinMethod.PIN || pinMethod === PinMethod.BIOMETRIC;
}
