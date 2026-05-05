jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    updateApp: jest.fn(),
    removeWalletPicture: jest.fn(),
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    updateObjectByPrimaryId: jest.fn(),
  },
}));

jest.mock('src/storage/enum', () => ({
  RealmSchema: {
    TribeApp: 'TribeApp',
  },
}));

import Relay from 'src/services/relay';
import dbManager from 'src/storage/realm/dbManager';
import { ProfileService } from '../src/services/handler/services/profileService';

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the realm profile when Relay reports success', async () => {
    (Relay.updateApp as jest.Mock).mockResolvedValueOnce({
      updated: true,
      imageUrl: 'https://image/url.png',
    });

    await expect(
      ProfileService.updateProfile('app-id', 'New Name', 'image-data', 'auth-token'),
    ).resolves.toBe(true);
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      'TribeApp',
      'id',
      'app-id',
      {
        appName: 'New Name',
        walletImage: 'https://image/url.png',
      },
    );
  });

  it('returns false when Relay says the profile was not updated', async () => {
    (Relay.updateApp as jest.Mock).mockResolvedValueOnce({ updated: false });

    await expect(
      ProfileService.updateProfile('app-id', 'New Name', 'image-data', 'auth-token'),
    ).resolves.toBe(false);
    expect(dbManager.updateObjectByPrimaryId).not.toHaveBeenCalled();
  });

  it('returns false when the profile update throws', async () => {
    (Relay.updateApp as jest.Mock).mockRejectedValueOnce(new Error('failed'));

    await expect(
      ProfileService.updateProfile('app-id', 'New Name', 'image-data', 'auth-token'),
    ).resolves.toBe(false);
  });

  it('clears the wallet picture when Relay reports success', async () => {
    (Relay.removeWalletPicture as jest.Mock).mockResolvedValueOnce({ success: true });

    await expect(ProfileService.removeWalletPicture('app-id', 'auth-token')).resolves.toEqual({
      success: true,
    });
    expect(dbManager.updateObjectByPrimaryId).toHaveBeenCalledWith(
      'TribeApp',
      'id',
      'app-id',
      { walletImage: null },
    );
  });

  it('returns the Relay response unchanged when wallet picture removal fails', async () => {
    (Relay.removeWalletPicture as jest.Mock).mockResolvedValueOnce({ success: false });

    await expect(ProfileService.removeWalletPicture('app-id', 'auth-token')).resolves.toEqual({
      success: false,
    });
    expect(dbManager.updateObjectByPrimaryId).not.toHaveBeenCalled();
  });
});