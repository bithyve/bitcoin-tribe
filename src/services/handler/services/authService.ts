import config from 'src/utils/config';
import { decrypt, encrypt, hash512, stringToArrayBuffer } from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import dbManager from 'src/storage/realm/dbManager';

export class AuthService {
  static async createPin(pin: string) {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    const newHash = hash512(pin);
    const encryptedKey = encrypt(newHash, key);
    await SecureStore.store(newHash, encryptedKey);
    Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
  }

  static async changePin({ key, pin = '' }: { key: string; pin?: string }) {
    const hash = hash512(pin || config.ENC_KEY_STORAGE_IDENTIFIER);
    const encryptedKey = encrypt(hash, key);
    await SecureStore.store(hash, encryptedKey);
    if (!pin) {
      Storage.set(Keys.PIN_METHOD, PinMethod.DEFAULT);
    }
  }

  static async verifyPin(pin: string) {
    try {
      const hash = hash512(pin);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      if (!key) {
        throw new Error('PIN not found');
      }
      return key;
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  }

  static async resetApp(key: string) {
    const uint8array = stringToArrayBuffer(key);
    await dbManager.deleteRealm(uint8array);
    Storage.clear();
  }
}
