import DeviceInfo from 'react-native-device-info';
import { AuthorizationStatus, getMessaging, getToken } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { PermissionsAndroid, Platform } from 'react-native';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { Keys, Storage } from 'src/storage';
import config from 'src/utils/config';
import RGBServices from 'src/services/rgb/RGBServices';
import Relay from 'src/services/relay';

export class AppLifecycleService {
  static readonly SESSION_TIMEOUT_MS = 15 * 60 * 1000;

  static hasSessionExpired(
    lastBackgroundTimestamp?: number,
    nowTimestamp: number = Date.now(),
    timeoutMs: number = AppLifecycleService.SESSION_TIMEOUT_MS,
  ): boolean {
    if (!lastBackgroundTimestamp || timeoutMs <= 0) {
      return false;
    }
    return nowTimestamp - lastBackgroundTimestamp >= timeoutMs;
  }

  static async manageFcmVersionTopics(
    previousVersion?: string,
    currentVersion?: string,
  ): Promise<void> {
    try {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);
      const appVersion = currentVersion || DeviceInfo.getVersion();
      const lastTopicVersion =
        previousVersion || Storage.get(Keys.LAST_FCM_VERSION_TOPIC);
      if (!lastTopicVersion || lastTopicVersion !== appVersion) {
        if (lastTopicVersion) {
          await AppLifecycleService.unsubscribeFromVersionTopic(
            messaging,
            String(lastTopicVersion),
          );
        }
        await AppLifecycleService.subscribeToVersionTopic(messaging, appVersion);
        Storage.set(Keys.LAST_FCM_VERSION_TOPIC, appVersion);
      }
      await AppLifecycleService.subscribeToBroadcastChannel(messaging);
      Storage.set(Keys.IS_TOPIC_SUBSCRIBED, true);
    } catch (error) {
      console.error('FCM topic management error:', error);
      throw error;
    }
  }

  private static async unsubscribeFromVersionTopic(
    messaging: any,
    version: string,
  ): Promise<void> {
    const topic = `v${version}`;
    try {
      await messaging.unsubscribeFromTopic(topic);
    } catch (error) {
      console.log(`Failed to unsubscribe from ${topic}:`, error);
    }
  }

  private static async subscribeToVersionTopic(
    messaging: any,
    version: string,
  ): Promise<void> {
    const topic = `v${version}`;
    try {
      await messaging.subscribeToTopic(topic);
    } catch (error) {
      console.error(`Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  private static async subscribeToBroadcastChannel(
    messaging: any,
  ): Promise<void> {
    try {
      await messaging.subscribeToTopic(config.TRIBE_FCM_BROADCAST_CHANNEL);
    } catch (error) {
      console.log('Failed to subscribe to common broadcast topic:', error);
    }
  }

  static async checkVersion(
    fetchGithubRelease: () => Promise<{ releaseNote: string }>,
  ) {
    try {
      const githubReleaseNote = await fetchGithubRelease();
      const versionHistoryData = dbManager.getCollection(
        RealmSchema.VersionHistory,
      );
      const lastIndex = versionHistoryData.length - 1;
      const version = dbManager.getObjectByIndex(
        RealmSchema.VersionHistory,
        lastIndex,
      ) as any;
      const currentVersion = `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`;
      if (version?.version !== currentVersion) {
        dbManager.createObject(RealmSchema.VersionHistory, {
          version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: githubReleaseNote.releaseNote,
          date: new Date().toString(),
          title: `Upgraded from ${version?.version || 'unknown'} to ${currentVersion}`,
        });
        await AppLifecycleService.manageFcmVersionTopics(
          version?.version,
          currentVersion,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.log('check Version', error);
      throw error;
    }
  }

  static async syncFcmToken(authToken: string): Promise<boolean> {
    try {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied on Android');
          return false;
        }
      }
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        return false;
      }
      const token = await getToken(messaging);
      const existingToken = Storage.get(Keys.FCM_TOKEN);

      if (token === existingToken) {
        await RGBServices.setWatchTowerFcmToken(token);
        return true;
      }

      const response = await Relay.syncFcmToken(authToken, token);
      if (response.updated) {
        Storage.set(Keys.FCM_TOKEN, token);
        await RGBServices.setWatchTowerFcmToken(token);
        return true;
      }

      return false;
    } catch (error: any) {
      console.log('fcm update error:', error?.message || error);
      throw error;
    }
  }
}
