const mockMessaging = {
  subscribeToTopic: jest.fn(() => Promise.resolve()),
  unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
  requestPermission: jest.fn(() => Promise.resolve(1)),
};
const mockGetToken = jest.fn(() => Promise.resolve('fcm-token'));

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({ name: 'firebase-app' })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  getMessaging: jest.fn(() => mockMessaging),
  getToken: (...args) => mockGetToken(...args),
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: jest.fn(() => '1.2.3'),
    getBuildNumber: jest.fn(() => '45'),
  },
}));

jest.mock('react-native', () => ({
  PermissionsAndroid: {
    PERMISSIONS: {
      POST_NOTIFICATIONS: 'POST_NOTIFICATIONS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    request: jest.fn(() => Promise.resolve('granted')),
  },
  Platform: {
    OS: 'ios',
    Version: 17,
  },
}));

jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getCollection: jest.fn(),
    getObjectByIndex: jest.fn(),
    createObject: jest.fn(),
  },
}));

jest.mock('src/storage/enum', () => ({
  RealmSchema: {
    VersionHistory: 'VersionHistory',
  },
}));

jest.mock('src/storage', () => ({
  Keys: {
    LAST_FCM_VERSION_TOPIC: 'LAST_FCM_VERSION_TOPIC',
    IS_TOPIC_SUBSCRIBED: 'IS_TOPIC_SUBSCRIBED',
    FCM_TOKEN: 'FCM_TOKEN',
  },
  Storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('src/utils/config', () => ({
  __esModule: true,
  default: {
    TRIBE_FCM_BROADCAST_CHANNEL: 'tribe-broadcast',
  },
}));

jest.mock('src/services/rgb/RGBServices', () => ({
  __esModule: true,
  default: {
    setWatchTowerFcmToken: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('src/services/relay', () => ({
  __esModule: true,
  default: {
    syncFcmToken: jest.fn(() => Promise.resolve({ updated: true })),
  },
}));

import { PermissionsAndroid, Platform } from 'react-native';
import dbManager from 'src/storage/realm/dbManager';
import { Storage } from 'src/storage';
import RGBServices from 'src/services/rgb/RGBServices';
import Relay from 'src/services/relay';
import { AppLifecycleService } from '../src/services/handler/services/appLifecycleService';

describe('AppLifecycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    (Platform as any).OS = 'ios';
    (Platform as any).Version = 17;
    (Storage.get as jest.Mock).mockReturnValue(undefined);
    (dbManager.getCollection as jest.Mock).mockReturnValue([{ version: '1.0.0(40)' }]);
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValue({ version: '1.0.0(40)' });
  });

  it('subscribes to the current version topic and broadcast channel when no previous version exists', async () => {
    await AppLifecycleService.manageFcmVersionTopics(undefined, '1.2.3');

    expect(mockMessaging.subscribeToTopic).toHaveBeenNthCalledWith(1, 'v1.2.3');
    expect(mockMessaging.subscribeToTopic).toHaveBeenNthCalledWith(2, 'tribe-broadcast');
    expect(Storage.set).toHaveBeenCalledWith('LAST_FCM_VERSION_TOPIC', '1.2.3');
    expect(Storage.set).toHaveBeenCalledWith('IS_TOPIC_SUBSCRIBED', true);
  });

  it('unsubscribes from the previous version before subscribing to the new one', async () => {
    await AppLifecycleService.manageFcmVersionTopics('1.0.0', '1.2.3');

    expect(mockMessaging.unsubscribeFromTopic).toHaveBeenCalledWith('v1.0.0');
    expect(mockMessaging.subscribeToTopic).toHaveBeenCalledWith('v1.2.3');
  });

  it('skips version-topic changes when the version has not changed', async () => {
    await AppLifecycleService.manageFcmVersionTopics('1.2.3', '1.2.3');

    expect(mockMessaging.unsubscribeFromTopic).not.toHaveBeenCalled();
    expect(mockMessaging.subscribeToTopic).toHaveBeenCalledTimes(1);
    expect(mockMessaging.subscribeToTopic).toHaveBeenCalledWith('tribe-broadcast');
  });

  it('throws when subscribing to the version topic fails', async () => {
    mockMessaging.subscribeToTopic.mockRejectedValueOnce(new Error('subscribe failed'));

    await expect(
      AppLifecycleService.manageFcmVersionTopics(undefined, '1.2.3'),
    ).rejects.toThrow('subscribe failed');
  });

  it('creates a version history entry and manages topics when the app version changes', async () => {
    const manageTopicsSpy = jest
      .spyOn(AppLifecycleService, 'manageFcmVersionTopics')
      .mockResolvedValueOnce();

    await expect(
      AppLifecycleService.checkVersion(async () => ({ releaseNote: 'new release' })),
    ).resolves.toBe(true);
    expect(dbManager.createObject).toHaveBeenCalledWith(
      'VersionHistory',
      expect.objectContaining({
        version: '1.2.3(45)',
        releaseNote: 'new release',
      }),
    );
    expect(manageTopicsSpy).toHaveBeenCalledWith('1.0.0(40)', '1.2.3(45)');
  });

  it('returns false when the stored version already matches the current version', async () => {
    (dbManager.getObjectByIndex as jest.Mock).mockReturnValueOnce({ version: '1.2.3(45)' });

    await expect(
      AppLifecycleService.checkVersion(async () => ({ releaseNote: 'same release' })),
    ).resolves.toBe(false);
    expect(dbManager.createObject).not.toHaveBeenCalled();
  });

  it('rethrows errors from checkVersion', async () => {
    (dbManager.getCollection as jest.Mock).mockImplementationOnce(() => {
      throw new Error('realm failure');
    });

    await expect(
      AppLifecycleService.checkVersion(async () => ({ releaseNote: 'same release' })),
    ).rejects.toThrow('realm failure');
  });

  it('returns false when Android notification permission is denied', async () => {
    (Platform as any).OS = 'android';
    (Platform as any).Version = 34;
    (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce('denied');

    await expect(AppLifecycleService.syncFcmToken('auth-token')).resolves.toBe(false);
  });

  it('returns false when FCM permission is not authorized', async () => {
    mockMessaging.requestPermission.mockResolvedValueOnce(0);

    await expect(AppLifecycleService.syncFcmToken('auth-token')).resolves.toBe(false);
  });

  it('reuses the existing FCM token without syncing when nothing changed', async () => {
    (Storage.get as jest.Mock).mockReturnValueOnce('fcm-token');

    await expect(AppLifecycleService.syncFcmToken('auth-token')).resolves.toBe(true);
    expect(Relay.syncFcmToken).not.toHaveBeenCalled();
    expect(RGBServices.setWatchTowerFcmToken).toHaveBeenCalledWith('fcm-token');
  });

  it('syncs and stores a new FCM token when Relay reports an update', async () => {
    (Storage.get as jest.Mock).mockReturnValueOnce('old-token');
    (Relay.syncFcmToken as jest.Mock).mockResolvedValueOnce({ updated: true });

    await expect(AppLifecycleService.syncFcmToken('auth-token')).resolves.toBe(true);
    expect(Relay.syncFcmToken).toHaveBeenCalledWith('auth-token', 'fcm-token');
    expect(Storage.set).toHaveBeenCalledWith('FCM_TOKEN', 'fcm-token');
    expect(RGBServices.setWatchTowerFcmToken).toHaveBeenCalledWith('fcm-token');
  });

  it('returns false when Relay does not update the token', async () => {
    (Storage.get as jest.Mock).mockReturnValueOnce('old-token');
    (Relay.syncFcmToken as jest.Mock).mockResolvedValueOnce({ updated: false });

    await expect(AppLifecycleService.syncFcmToken('auth-token')).resolves.toBe(false);
  });

  it('rethrows syncFcmToken errors', async () => {
    mockGetToken.mockRejectedValueOnce(new Error('token failed'));

    await expect(AppLifecycleService.syncFcmToken('auth-token')).rejects.toThrow(
      'token failed',
    );
  });
});