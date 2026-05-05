const mockRLNNodeApiServices = jest.fn();

jest.mock('src/services/rgbnode/RLNNodeApi', () => ({
  RLNNodeApiServices: (...args) => mockRLNNodeApiServices(...args),
}));

function loadApiHandler() {
  jest.resetModules();
  return require('../src/services/handler/runtimeApi').ApiHandler;
}

describe('runtimeApi ApiHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not initialize RLN API services for on-chain apps', () => {
    const ApiHandler = loadApiHandler();

    new ApiHandler({ nodeUrl: 'https://node', nodeAuthentication: 'token' }, 'ON_CHAIN', 'auth');

    expect(mockRLNNodeApiServices).not.toHaveBeenCalled();
  });

  it('initializes RLN API services for node-connect apps', () => {
    const ApiHandler = loadApiHandler();

    new ApiHandler({ nodeUrl: 'https://node', nodeAuthentication: 'token' }, 'NODE_CONNECT', 'auth');

    expect(mockRLNNodeApiServices).toHaveBeenCalledWith({
      baseUrl: 'https://node',
      apiKey: 'token',
    });
  });

  it('initializes only once even if constructed multiple times', () => {
    const ApiHandler = loadApiHandler();

    new ApiHandler({ nodeUrl: 'https://node', nodeAuthentication: 'token' }, 'SUPPORTED_RLN', 'auth');
    new ApiHandler({ nodeUrl: 'https://node-2', nodeAuthentication: 'token-2' }, 'SUPPORTED_RLN', 'auth');

    expect(mockRLNNodeApiServices).toHaveBeenCalledTimes(1);
  });
});