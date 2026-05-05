const mockIsAvailable = jest.fn();
const mockRequestInAppReview = jest.fn(() => Promise.resolve());

function loadRequestAppReview(environment = 'production') {
  jest.resetModules();
  jest.doMock('react-native-in-app-review', () => ({
    __esModule: true,
    default: {
      isAvailable: (...args) => mockIsAvailable(...args),
      RequestInAppReview: (...args) => mockRequestInAppReview(...args),
    },
  }));
  jest.doMock('src/utils/config', () => ({
    __esModule: true,
    default: {
      ENVIRONMENT: environment,
    },
    APP_STAGE: {
      DEVELOPMENT: 'development',
    },
  }));

  return require('../src/services/appreview').requestAppReview;
}

describe('appreview service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early in development', async () => {
    const requestAppReview = loadRequestAppReview('development');

    await requestAppReview();

    expect(mockIsAvailable).not.toHaveBeenCalled();
    expect(mockRequestInAppReview).not.toHaveBeenCalled();
  });

  it('requests a review when the API is available', async () => {
    const requestAppReview = loadRequestAppReview('production');
    mockIsAvailable.mockResolvedValueOnce(true);

    await requestAppReview();

    expect(mockIsAvailable).toHaveBeenCalledTimes(1);
    expect(mockRequestInAppReview).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the API is unavailable', async () => {
    const requestAppReview = loadRequestAppReview('production');
    mockIsAvailable.mockResolvedValueOnce(false);

    await requestAppReview();

    expect(mockRequestInAppReview).not.toHaveBeenCalled();
  });
});