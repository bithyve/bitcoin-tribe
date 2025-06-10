import { hexToBase64 } from '../src/utils/hexToBase64';

describe('hexToBase64', () => {
  it('converts valid hex string to base64', () => {
    const { base64, fileType } = hexToBase64('FFD8FF');
    expect(base64).toBe('/9j/');
    expect(fileType).toBe('image/jpeg');
  });

  it('throws on invalid hex string', () => {
    expect(() => hexToBase64('abc')).toThrow('Invalid hex string');
  });
});
