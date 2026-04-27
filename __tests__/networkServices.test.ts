import {
  getBitcoinNetwork,
  getElectrumUrl,
  loadGithubReleaseNotes,
  fetchGithubRelease,
  setNetworkServicesTestDeps,
  resetNetworkServicesTestDeps,
} from '../src/services/handler/services/networkServices';

function createNetworkServicesDepsMock() {
  return {
    getBitcoinNetwork: jest.fn(),
    getElectrumUrl: jest.fn(),
    loadGithubReleaseNotes: jest.fn(),
    fetchGithubRelease: jest.fn(),
  } as any;
}

describe('networkServices', () => {
  const mockDeps = createNetworkServicesDepsMock();

  beforeEach(() => {
    jest.clearAllMocks();
    setNetworkServicesTestDeps(mockDeps);
  });

  afterEach(() => {
    resetNetworkServicesTestDeps();
  });

  it('delegates getBitcoinNetwork', () => {
    mockDeps.getBitcoinNetwork.mockReturnValue('testnet');

    const result = getBitcoinNetwork();

    expect(result).toBe('testnet');
    expect(mockDeps.getBitcoinNetwork).toHaveBeenCalledTimes(1);
  });

  it('delegates getElectrumUrl', () => {
    mockDeps.getElectrumUrl.mockReturnValue('electrum://host');

    const result = getElectrumUrl('testnet' as any);

    expect(result).toBe('electrum://host');
    expect(mockDeps.getElectrumUrl).toHaveBeenCalledWith('testnet');
  });

  it('delegates loadGithubReleaseNotes', async () => {
    mockDeps.loadGithubReleaseNotes.mockResolvedValue('notes');

    const result = await loadGithubReleaseNotes('1.2.3');

    expect(result).toBe('notes');
    expect(mockDeps.loadGithubReleaseNotes).toHaveBeenCalledWith('1.2.3');
  });

  it('delegates fetchGithubRelease', async () => {
    const payload = { releaseNote: 'note' };
    mockDeps.fetchGithubRelease.mockResolvedValue(payload);

    const result = await fetchGithubRelease();

    expect(result).toEqual(payload);
    expect(mockDeps.fetchGithubRelease).toHaveBeenCalledTimes(1);
  });
});
