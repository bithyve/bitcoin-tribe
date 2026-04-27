type ProfileServicesDeps = {
  getAuthToken: () => string;
  updateProfile: (
    appID: string,
    appName: string,
    walletImage: any,
    authToken: string,
  ) => Promise<any>;
  removeWalletPicture: (appID: string, authToken: string) => Promise<any>;
  manageFcmVersionTopics: (
    previousVersion?: string,
    currentVersion?: string,
  ) => Promise<void>;
  checkVersion: (
    fetchGithubRelease: () => Promise<{ releaseNote: string }>,
  ) => Promise<any>;
  syncFcmToken: (authToken: string) => Promise<boolean>;
  fetchGithubRelease: () => Promise<{ releaseNote: string }>;
};

function createDefaultDeps(): ProfileServicesDeps {
  return {
    getAuthToken: () => {
      const { RealmSchema } = require('src/storage/enum');
      const dbManager = require('src/storage/realm/dbManager').default;
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as {
        authToken?: string;
      };
      return app?.authToken || '';
    },
    updateProfile: async (appID, appName, walletImage, authToken) => {
      const { ProfileService } = require('./profileService');
      return ProfileService.updateProfile(appID, appName, walletImage, authToken);
    },
    removeWalletPicture: async (appID, authToken) => {
      const { ProfileService } = require('./profileService');
      return ProfileService.removeWalletPicture(appID, authToken);
    },
    manageFcmVersionTopics: async (previousVersion, currentVersion) => {
      const { AppLifecycleService } = require('./appLifecycleService');
      return AppLifecycleService.manageFcmVersionTopics(
        previousVersion,
        currentVersion,
      );
    },
    checkVersion: async fetchGithubRelease => {
      const { AppLifecycleService } = require('./appLifecycleService');
      return AppLifecycleService.checkVersion(fetchGithubRelease);
    },
    syncFcmToken: async authToken => {
      const { AppLifecycleService } = require('./appLifecycleService');
      return AppLifecycleService.syncFcmToken(authToken);
    },
    fetchGithubRelease: async () => {
      const { NetworkService } = require('./networkService');
      return NetworkService.fetchGithubRelease();
    },
  };
}

const defaultDeps: ProfileServicesDeps = createDefaultDeps();

let deps: ProfileServicesDeps = { ...defaultDeps };

export function setProfileServicesTestDeps(
  overrides: Partial<ProfileServicesDeps>,
) {
  deps = {
    ...deps,
    ...overrides,
  };
}

export function resetProfileServicesTestDeps() {
  deps = createDefaultDeps();
}

export async function updateProfile(
  appID: string,
  appName: string,
  walletImage: any,
) {
  return deps.updateProfile(
    appID,
    appName,
    walletImage,
    deps.getAuthToken(),
  );
}

export async function removeWalletPicture(appID: string) {
  return deps.removeWalletPicture(appID, deps.getAuthToken());
}

export async function manageFcmVersionTopics(
  previousVersion?: string,
  currentVersion?: string,
): Promise<void> {
  return deps.manageFcmVersionTopics(
    previousVersion,
    currentVersion,
  );
}

export async function checkVersion() {
  return deps.checkVersion(deps.fetchGithubRelease);
}

export async function syncFcmToken(): Promise<boolean> {
  return deps.syncFcmToken(deps.getAuthToken());
}
