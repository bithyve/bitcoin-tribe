jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    ENC_KEY_STORAGE_IDENTIFIER: 'enc-id',
  },
}));

jest.mock('src/utils/encryption', () => ({
  decrypt: jest.fn(() => 'decrypted-key'),
  encrypt: jest.fn(() => 'encrypted-key'),
  hash512: jest.fn((value: string) => `hash-${value}`),
  stringToArrayBuffer: jest.fn(() => new Uint8Array([1, 2, 3])),
}));

jest.mock('src/storage/secure-store', () => ({
  fetch: jest.fn(() => Promise.resolve('stored-encrypted-key')),
  store: jest.fn(() => Promise.resolve()),
}));

jest.mock('src/storage', () => ({
  Keys: {
    PIN_METHOD: 'PIN_METHOD',
  },
  Storage: {
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('src/models/enums/PinMethod', () => ({
  __esModule: true,
  default: {
    PIN: 'PIN',
    DEFAULT: 'DEFAULT',
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    deleteRealm: jest.fn(() => Promise.resolve()),
  },
}));

import { decrypt, encrypt, hash512, stringToArrayBuffer } from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import { Storage } from 'src/storage';
import dbManager from 'src/storage/realm/dbManager';
import { AuthService } from '../src/services/handler/services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createPin stores a new encrypted key and switches PIN method', async () => {
    await AuthService.createPin('1234');

    expect(hash512).toHaveBeenCalledWith('enc-id');
    expect(SecureStore.fetch).toHaveBeenCalledWith('hash-enc-id');
    expect(decrypt).toHaveBeenCalledWith('hash-enc-id', 'stored-encrypted-key');
    expect(hash512).toHaveBeenCalledWith('1234');
    expect(encrypt).toHaveBeenCalledWith('hash-1234', 'decrypted-key');
    expect(SecureStore.store).toHaveBeenCalledWith('hash-1234', 'encrypted-key');
    expect(Storage.set).toHaveBeenCalledWith('PIN_METHOD', 'PIN');
  });

  it('changePin stores the encrypted key with the provided pin hash', async () => {
    await AuthService.changePin({ key: 'my-key', pin: '5678' });

    expect(hash512).toHaveBeenCalledWith('5678');
    expect(encrypt).toHaveBeenCalledWith('hash-5678', 'my-key');
    expect(SecureStore.store).toHaveBeenCalledWith('hash-5678', 'encrypted-key');
    expect(Storage.set).not.toHaveBeenCalled();
  });

  it('changePin resets to the default pin method when pin is omitted', async () => {
    await AuthService.changePin({ key: 'my-key' });

    expect(hash512).toHaveBeenCalledWith('enc-id');
    expect(SecureStore.store).toHaveBeenCalledWith('hash-enc-id', 'encrypted-key');
    expect(Storage.set).toHaveBeenCalledWith('PIN_METHOD', 'DEFAULT');
  });

  it('verifyPin returns the decrypted key when the pin exists', async () => {
    const result = await AuthService.verifyPin('1234');

    expect(result).toBe('decrypted-key');
    expect(SecureStore.fetch).toHaveBeenCalledWith('hash-1234');
  });

  it('verifyPin throws Invalid PIN when no key is found', async () => {
    (decrypt as jest.Mock).mockReturnValueOnce('');

    await expect(AuthService.verifyPin('1234')).rejects.toThrow('Invalid PIN');
  });

  it('verifyPin throws Invalid PIN when decryption fails', async () => {
    (decrypt as jest.Mock).mockImplementationOnce(() => {
      throw new Error('decrypt failed');
    });

    await expect(AuthService.verifyPin('1234')).rejects.toThrow('Invalid PIN');
  });

  it('resetApp deletes the realm and clears storage', async () => {
    await AuthService.resetApp('realm-key');

    expect(stringToArrayBuffer).toHaveBeenCalledWith('realm-key');
    expect(dbManager.deleteRealm).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(Storage.clear).toHaveBeenCalledTimes(1);
  });
});