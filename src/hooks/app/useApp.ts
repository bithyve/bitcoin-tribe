import { useMutation, useQuery } from 'react-query';
import { AppService } from 'src/services/app/AppService';
import { ImageAsset } from 'src/models/interfaces/ImageAsset'; // Checking if this import works
import AppType from 'src/models/enums/AppType';
import PinMethod from 'src/models/enums/PinMethod';
import { RgbNodeConnectParams, NodeInfo } from 'src/models/interfaces/RGBWallet';
import DeviceInfo from 'react-native-device-info';

export const useApp = () => {
  const appService = AppService.getInstance();

  const setupNewAppMutation = useMutation(
    async (params: {
      appName: string;
      pinMethod: PinMethod;
      passcode: '';
      walletImage: ImageAsset;
      mnemonic: string | null;
      appType: AppType;
      rgbNodeConnectParams?: RgbNodeConnectParams;
      rgbNodeInfo?: NodeInfo;
      authToken?: string;
      isRestore?: boolean;
    }) => {
      return await appService.setupNewApp(params);
    }
  );

  const restoreAppMutation = useMutation(async (mnemonic: string) => {
    return await appService.restoreApp(mnemonic);
  });

  const restoreWithBackupFileMutation = useMutation(
      async (params: { mnemonic: string; filePath: string }) => {
          return await appService.restoreWithBackupFile(params);
      }
  );

  const resetAppMutation = useMutation(async (key: string) => {
    return await appService.resetApp(key);
  });

  const fetchGithubReleaseQuery = useQuery(['githubRelease'], async () => {
      return await appService.fetchGithubRelease();
  });

  const loadGithubReleaseNotesMutation = useMutation(async (version: string) => {
      return await appService.loadGithubReleaseNotes(version);
  });
  
  const makeWalletOnlineMutation = useMutation(async (timeout?: number) => {
      return await appService.makeWalletOnline(timeout);
  });

  const checkVersionMutation = useMutation(async () => {
      return await appService.checkVersion();
  });

  const syncFcmTokenMutation = useMutation(async () => {
      return await appService.syncFcmToken();
  });

  const manageFcmVersionTopicsMutation = useMutation(async (params?: { previousVersion?: string, currentVersion?: string }) => {
      return await appService.manageFcmVersionTopics(params?.previousVersion, params?.currentVersion);
  });
  
  const backupAppImageMutation = useMutation(async (params: any) => {
      // Logic for backupAppImage is in BackupService, not AppService?
      // Home.tsx called ApiHandler.backupAppImage.
      // I moved it to BackupService. 
      // So useBackup should handle it. 
      // I'll check useBackup.
  });

  return {
    checkVersion: checkVersionMutation,
    syncFcmToken: syncFcmTokenMutation,
    manageFcmVersionTopics: manageFcmVersionTopicsMutation,
    setupNewApp: setupNewAppMutation,
    restoreApp: restoreAppMutation,
    restoreWithBackupFile: restoreWithBackupFileMutation,
    makeWalletOnline: makeWalletOnlineMutation,
    resetApp: resetAppMutation,
    fetchGithubRelease: fetchGithubReleaseQuery,
    loadGithubReleaseNotes: loadGithubReleaseNotesMutation,
    makeWalletOnline: makeWalletOnlineMutation
  };
};
