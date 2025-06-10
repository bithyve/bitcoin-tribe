import {it, expect} from '@jest/globals';
import {hexToBase64} from '../src/utils/hexToBase64';

it('converts valid hex string to base64', () => {
  const result = hexToBase64('48656c6c6f');
  expect(result).not.toBeNull();
  expect(result?.base64).toBe('SGVsbG8=');
  expect(result?.fileType).toBe('unknown');
});

it('returns null for hex string with odd length', () => {
  expect(hexToBase64('abc')).toBeNull();
});

it('returns null for hex string with invalid characters', () => {
  expect(hexToBase64('zz')).toBeNull();
});
