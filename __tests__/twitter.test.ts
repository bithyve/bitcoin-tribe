const mockAuthorize = jest.fn();
const mockStorage = {
  getString: jest.fn(),
  set: jest.fn(),
};

jest.mock('react-native-app-auth', () => ({
  __esModule: true,
  authorize: (...args) => mockAuthorize(...args),
}));

jest.mock('react-native-mmkv', () => {
  const createMMKV = jest.fn(() => mockStorage);

  return {
    __esModule: true,
    createMMKV,
    default: {
      createMMKV,
    },
  };
});

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    TWITTER_CLIENT_ID: 'twitter-client-id',
  },
}));

function loadTwitterService() {
  jest.resetModules();
  return require('../src/services/twitter');
}

describe('twitter service', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (global as any).fetch = mockFetch;
  });

  it('getXProfile returns the parsed response data', async () => {
    const { getXProfile } = loadTwitterService();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({ data: { id: '1' } })),
    });

    await expect(getXProfile('access-token')).resolves.toEqual({ data: { id: '1' } });
    expect(mockFetch).toHaveBeenCalledWith('https://api.twitter.com/2/users/me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json',
      },
    });
  });

  it('getXProfile throws when the profile request fails', async () => {
    const { getXProfile } = loadTwitterService();

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(getXProfile('access-token')).rejects.toThrow(
      'Error fetching X profile: 500',
    );
  });

  it('loginWithTwitter authorizes, stores the token, and returns the profile summary', async () => {
    const { loginWithTwitter } = loadTwitterService();

    mockAuthorize.mockResolvedValueOnce({ accessToken: 'token-1' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Alice', username: 'alice' } })),
    });

    await expect(loginWithTwitter()).resolves.toEqual({
      id: '1',
      name: 'Alice',
      username: 'alice',
    });
    expect(mockStorage.set).toHaveBeenCalledWith('accessToken', 'token-1');
  });

  it('loginWithTwitter throws when authorize returns no access token', async () => {
    const { loginWithTwitter } = loadTwitterService();

    mockAuthorize.mockResolvedValueOnce({});

    await expect(loginWithTwitter()).rejects.toThrow('No access token received');
  });

  it('fetchAndVerifyTweet uses the stored token when the first request succeeds', async () => {
    const { fetchAndVerifyTweet } = loadTwitterService();

    mockStorage.getString.mockReturnValueOnce('stored-token');
    const successResponse = { status: 200 };
    mockFetch.mockResolvedValueOnce(successResponse);

    await expect(fetchAndVerifyTweet('tweet-1')).resolves.toBe(successResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.twitter.com/2/tweets/tweet-1',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer stored-token' }),
      }),
    );
  });

  it('reauthorizes and retries when the first tweet request returns 401', async () => {
    const { fetchAndVerifyTweet } = loadTwitterService();

    mockStorage.getString.mockReturnValueOnce('expired-token');
    mockAuthorize.mockResolvedValueOnce({ accessToken: 'fresh-token' });
    mockFetch
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ status: 200, ok: true });

    await expect(fetchAndVerifyTweet('tweet-1')).resolves.toEqual({ status: 200, ok: true });
    expect(mockStorage.set).toHaveBeenCalledWith('accessToken', 'fresh-token');
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.twitter.com/2/tweets/tweet-1',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer fresh-token' }),
      }),
    );
  });

  it('throws when reauthorization after 401 returns no access token', async () => {
    const { fetchAndVerifyTweet } = loadTwitterService();

    mockStorage.getString.mockReturnValueOnce('expired-token');
    mockAuthorize.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce({ status: 401 });

    await expect(fetchAndVerifyTweet('tweet-1')).rejects.toThrow(
      'Authorization failed: No access token',
    );
    expect(console.error).toHaveBeenCalled();
  });
});