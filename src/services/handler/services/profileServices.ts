import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { ProfileService } from './profileService';
import { AppLifecycleService } from './appLifecycleService';
import { NetworkService } from './networkService';

function getAuthToken(): string {
  const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
  return app?.authToken;
}

export async function updateProfile(
  appID: string,
  appName: string,
  walletImage: any,
) {
  return ProfileService.updateProfile(appID, appName, walletImage, getAuthToken());
}

export async function removeWalletPicture(appID: string) {
  return ProfileService.removeWalletPicture(appID, getAuthToken());
}

export async function manageFcmVersionTopics(
  previousVersion?: string,
  currentVersion?: string,
): Promise<void> {
  return AppLifecycleService.manageFcmVersionTopics(previousVersion, currentVersion);
}

export async function checkVersion() {
  return AppLifecycleService.checkVersion(NetworkService.fetchGithubRelease);
}

export async function syncFcmToken(): Promise<boolean> {
  return AppLifecycleService.syncFcmToken(getAuthToken());
}
