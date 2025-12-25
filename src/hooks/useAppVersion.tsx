import { useMemo } from 'react';
import DeviceInfo from 'react-native-device-info';
import { NativeModules, Platform } from 'react-native';
const { AndroidInAppUpdate } = NativeModules;

type AppVersionInfo = {
  version: string;
  build: string;
  isVersionLowerOrEqualTo: (targetVersion: string) => boolean;
  checkAndInitiateAndroidUpdate: () => Promise<any>;
};

export const useAppVersion = (): AppVersionInfo => {
  const version = DeviceInfo.getVersion();
  const build = DeviceInfo.getBuildNumber();

  const isVersionLowerOrEqualTo = (targetVersion: string): boolean => {
    const current = version.split('.').map(Number);
    const target = targetVersion.split('.').map(Number);
    const maxLength = Math.max(current.length, target.length);
    for (let i = 0; i < maxLength; i++) {
      const curr = current[i] ?? 0;
      const targ = target[i] ?? 0;
      if (curr < targ) return true;
      if (curr > targ) return false;
    }
    // versions are equal
    return false;
  };

  const checkAndInitiateAndroidUpdate = async () => {
  if (Platform.OS !== 'android') return false;

  try {
    return await AndroidInAppUpdate.checkAndUpdate(true);
  } catch (e) {
    console.log('Android update error', e);
    return false;
  }
}

  return useMemo(
    () => ({
      version,
      build,
      isVersionLowerOrEqualTo,
      checkAndInitiateAndroidUpdate
    }),
    [version, build]
  );
};
