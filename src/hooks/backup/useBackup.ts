import { useMutation } from 'react-query';
import { BackupService } from 'src/services/backup/BackupService';

export const useBackup = () => {
  const backupService = BackupService.getInstance();

  const backupMutation = useMutation(async () => {
    return await backupService.backup();
  });

  const createBackupMutation = useMutation(async (confirmed: boolean) => {
    return await backupService.createBackup(confirmed);
  });

  const isBackupRequiredQuery = useMutation(async () => {
      return await backupService.isBackupRequired();
  });

  const backupAppImageMutation = useMutation(
    async (params: {
      settings?: boolean;
      room?: null | any;
      all?: boolean;
      tnxMeta?: null | { txid: string; metaData: object };
    }) => {
      return await backupService.backupAppImage(params);
    }
  );

  const restoreAppImageMutation = useMutation(
    async (params: {
        mnemonic: string,
        settingsObject?: any,
        roomsObject?: any,
        tnxMetaObject?: any
    }) => {
      return await backupService.restoreAppImage(params);
    }
  );

  return {
    backup: backupMutation,
    createBackup: createBackupMutation,
    isBackupRequired: isBackupRequiredQuery, // Using mutation for on-demand check if needed, or could be useQuery
    backupAppImage: backupAppImageMutation,
    restoreAppImage: restoreAppImageMutation
  };
};
