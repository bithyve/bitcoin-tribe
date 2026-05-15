type BackupUiHandlers = {
  setBackupInProgress: (status: boolean) => void;
  setBackupDone: (status: boolean) => void;
  setManualAssetBackupStatus: (status: boolean) => void;
};

let handlers: BackupUiHandlers = {
  setBackupInProgress: () => {},
  setBackupDone: () => {},
  setManualAssetBackupStatus: () => {},
};

let manualBackupStatusTimeout: ReturnType<typeof setTimeout> | null = null;

export function registerBackupUiHandlers(next: Partial<BackupUiHandlers>) {
  handlers = {
    ...handlers,
    ...next,
  };
}

export function unregisterBackupUiHandlers() {
  if (manualBackupStatusTimeout) {
    clearTimeout(manualBackupStatusTimeout);
    manualBackupStatusTimeout = null;
  }
  handlers = {
    setBackupInProgress: () => {},
    setBackupDone: () => {},
    setManualAssetBackupStatus: () => {},
  };
}

export function backupStarted() {
  handlers.setBackupInProgress(true);
}

export function backupFinished() {
  handlers.setBackupInProgress(false);
}

export function backupSucceeded() {
  handlers.setBackupDone(true);
  if (manualBackupStatusTimeout) {
    clearTimeout(manualBackupStatusTimeout);
  }
  manualBackupStatusTimeout = setTimeout(() => {
    handlers.setManualAssetBackupStatus(true);
  }, 1500);
}

