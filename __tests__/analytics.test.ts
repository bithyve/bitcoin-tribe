const mockLogEvent = jest.fn(() => Promise.resolve());

jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: mockLogEvent,
}));

import { events, logCustomEvent } from '../src/services/analytics';

describe('analytics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('logs custom events through Firebase analytics', async () => {
    await logCustomEvent(events.CREATE_NEW_APP, { appType: 'ON_CHAIN' });

    expect(mockLogEvent).toHaveBeenCalledWith('create_new_app', {
      appType: 'ON_CHAIN',
    });
  });

  it('swallows analytics failures after logging them', async () => {
    mockLogEvent.mockRejectedValueOnce(new Error('analytics down'));

    await expect(logCustomEvent('broken_event', {})).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalled();
  });

  it('exports the expected analytics event names', () => {
    expect(events.TWITTER_VERIFIED).toBe('twitter_verified');
    expect(events.DOMAIN_VERIFIED).toBe('domain_verified');
  });
});