const mockAxios = {
  post: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

function loadRestClient() {
  jest.resetModules();
  jest.doMock('axios', () => ({
    __esModule: true,
    default: mockAxios,
  }));
  jest.doMock('react-native-device-info', () => ({
    __esModule: true,
    default: {
      getVersion: jest.fn(() => '1.2.3'),
      getBuildNumber: jest.fn(() => '45'),
    },
  }));
  jest.doMock('react-native', () => ({
    Platform: {
      OS: 'ios',
    },
  }));
  jest.doMock('src/utils/config', () => ({
    __esModule: true,
    default: {
      HEXA_ID: 'hexa-id',
    },
  }));

  return require('../src/services/rest/RestClient').default;
}

describe('RestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds common headers from config, device info, and platform', () => {
    const RestClient = loadRestClient();

    expect(RestClient.getCommonHeaders()).toEqual({
      'HEXA-ID': 'hexa-id',
      HEXA_ID: 'hexa-id',
      appVersion: '1.2.3',
      buildNumber: '45',
      os: 'ios',
    });
  });

  it('returns a circular replacer that drops repeated references', () => {
    const RestClient = loadRestClient();
    const parent: any = { name: 'root' };
    parent.self = parent;

    const result = JSON.stringify(parent, RestClient.getCircularReplacer());

    expect(result).toBe('{"name":"root"}');
  });

  it('posts with merged common and custom headers', async () => {
    const RestClient = loadRestClient();
    mockAxios.post.mockResolvedValueOnce({ data: { ok: true } });

    await RestClient.post('/path', { hello: 'world' }, { Authorization: 'Bearer token' });

    expect(mockAxios.post).toHaveBeenCalledWith('/path', { hello: 'world' }, {
      headers: {
        ...RestClient.getCommonHeaders(),
        Authorization: 'Bearer token',
      },
    });
  });

  it('puts with merged headers', async () => {
    const RestClient = loadRestClient();
    mockAxios.put.mockResolvedValueOnce({ data: { ok: true } });

    await RestClient.put('/path', { hello: 'world' }, { 'X-Test': '1' });

    expect(mockAxios.put).toHaveBeenCalledWith('/path', { hello: 'world' }, {
      headers: {
        ...RestClient.getCommonHeaders(),
        'X-Test': '1',
      },
    });
  });

  it('gets with merged headers', async () => {
    const RestClient = loadRestClient();
    mockAxios.get.mockResolvedValueOnce({ data: { ok: true } });

    await RestClient.get('/path', { 'X-Test': '1' });

    expect(mockAxios.get).toHaveBeenCalledWith('/path', {
      headers: {
        ...RestClient.getCommonHeaders(),
        'X-Test': '1',
      },
    });
  });

  it('deletes with merged headers and request body', async () => {
    const RestClient = loadRestClient();
    mockAxios.delete.mockResolvedValueOnce({ data: { ok: true } });

    await RestClient.delete('/path', { id: 1 }, { Authorization: 'Bearer token' });

    expect(mockAxios.delete).toHaveBeenCalledWith('/path', {
      headers: {
        ...RestClient.getCommonHeaders(),
        Authorization: 'Bearer token',
      },
      data: { id: 1 },
    });
  });
});