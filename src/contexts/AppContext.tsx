import React, { useState } from 'react';
import AppType from 'src/models/enums/AppType';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
  isWalletOnline: null,
  setIsWalletOnline: status => {},
  appType: null,
  setAppType: apptype => {},
  isBackupInProgress: null,
  setBackupProcess: status => {},
  isBackupDone: null,
  setBackupDone: status => {},
  manualAssetBackupStatus: null,
  setManualAssetBackupStatus: status => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [isWalletOnline, setIsWalletOnline] = useState<boolean>(null);
  const [appType, setAppType] = useState<AppType>(null);
  const [isBackupInProgress, setBackupProcess] = useState<boolean>(null);
  const [isBackupDone, setBackupDone] = useState<boolean>(null);
  const [manualAssetBackupStatus, setManualAssetBackupStatus] =
    useState<boolean>(null);

  return (
    <AppContext.Provider
      value={{
        key,
        setKey: setKey,
        isWalletOnline,
        setIsWalletOnline: setIsWalletOnline,
        appType,
        setAppType: setAppType,
        isBackupInProgress,
        setBackupProcess: setBackupProcess,
        isBackupDone,
        setBackupDone: setBackupDone,
        manualAssetBackupStatus,
        setManualAssetBackupStatus: setManualAssetBackupStatus,
      }}>
      {children}
    </AppContext.Provider>
  );
}
