import {
  updateProfile,
  removeWalletPicture,
  manageFcmVersionTopics,
  checkVersion,
  syncFcmToken,
  setProfileServicesTestDeps,
  resetProfileServicesTestDeps,
} from '../src/services/handler/services/profileServices';

function createProfileServicesDepsMock() {
  return {
    getAuthToken: jest.fn(),
    updateProfile: jest.fn(),
    removeWalletPicture: jest.fn(),
    manageFcmVersionTopics: jest.fn(),
    checkVersion: jest.fn(),
    syncFcmToken: jest.fn(),
    fetchGithubRelease: jest.fn(),
  } as any;
}

describe('profileServices', () => {
  const mockDeps = createProfileServicesDepsMock();

  beforeEach(() => {
    jest.clearAllMocks();
    setProfileServicesTestDeps(mockDeps);
    mockDeps.getAuthToken.mockReturnValue('token-123');
  });

  afterEach(() => {
    resetProfileServicesTestDeps();
  });

  it('passes auth token to updateProfile', async () => {
    mockDeps.updateProfile.mockResolvedValue(true);

    const result = await updateProfile('app-id', 'name', { uri: 'image' });

    expect(result).toBe(true);
    expect(mockDeps.updateProfile).toHaveBeenCalledWith(
      'app-id',
      'name',
      { uri: 'image' },
      'token-123',
    );
  });

  it('passes auth token to removeWalletPicture', async () => {
    mockDeps.removeWalletPicture.mockResolvedValue({ success: true });

    const result = await removeWalletPicture('app-id');

    expect(result).toEqual({ success: true });
    expect(mockDeps.removeWalletPicture).toHaveBeenCalledWith(
      'app-id',
      'token-123',
    );
  });

  it('delegates manageFcmVersionTopics', async () => {
    await manageFcmVersionTopics('1.0.0', '1.1.0');

    expect(mockDeps.manageFcmVersionTopics).toHaveBeenCalledWith(
      '1.0.0',
      '1.1.0',
    );
  });

  it('delegates checkVersion with fetchGithubRelease dependency', async () => {
    mockDeps.checkVersion.mockResolvedValue(true);

    const result = await checkVersion();

    expect(result).toBe(true);
    expect(mockDeps.checkVersion).toHaveBeenCalledWith(
      mockDeps.fetchGithubRelease,
    );
  });

  it('passes auth token to syncFcmToken', async () => {
    mockDeps.syncFcmToken.mockResolvedValue(true);

    const result = await syncFcmToken();

    expect(result).toBe(true);
    expect(mockDeps.syncFcmToken).toHaveBeenCalledWith('token-123');
  });
});
