import {it, expect} from '@jest/globals';
import * as Keychain from 'react-native-keychain';
import {remove} from '../src/storage/secure-store';

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    ENC_KEY_STORAGE_IDENTIFIER: 'test-key-id',
  },
}));

jest.mock('react-native-keychain', () => ({
  resetGenericPassword: jest.fn(),
}));

it('remove resolves true when resetGenericPassword succeeds', async () => {
  (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
  await expect(remove('test')).resolves.toBe(true);
});
