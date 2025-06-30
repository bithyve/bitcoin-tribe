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
  hasCompletedManualBackup: null,
  setHasCompletedManualBackup: status => {},
  hasCompleteVerification: null,
  setCompleteVerification: status => {},
  hasIssuedAsset: null,
  setHasIssuedAsset: status => {},
  isNodeInitInProgress: null,
  setNodeInitStatus: status => {},
  isNodeConnect: null,
  setNodeConnected: status => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [isWalletOnline, setIsWalletOnline] = useState<boolean>(null);
  const [appType, setAppType] = useState<AppType>(null);
  const [isBackupInProgress, setBackupProcess] = useState<boolean>(null);
  const [isBackupDone, setBackupDone] = useState<boolean>(null);
  const [manualAssetBackupStatus, setManualAssetBackupStatus] =
    useState<boolean>(null);
  const [hasCompletedManualBackup, setHasCompletedManualBackup] =
    useState(null);
  const [hasCompleteVerification, setCompleteVerification] =
    useState<boolean>(null);
  const [hasIssuedAsset, setHasIssuedAsset] = useState<boolean>(null);
  const [isNodeInitInProgress, setNodeInitStatus] = useState<boolean>(null);
  const [isNodeConnect, setNodeConnected] = useState<boolean>(null);
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
        hasCompletedManualBackup,
        setHasCompletedManualBackup: setHasCompletedManualBackup,
        hasCompleteVerification,
        setCompleteVerification: setCompleteVerification,
        hasIssuedAsset,
        setHasIssuedAsset: setHasIssuedAsset,
        isNodeInitInProgress,
        setNodeInitStatus: setNodeInitStatus,
        isNodeConnect,
        setNodeConnected: setNodeConnected,
      }}>
      {children}
    </AppContext.Provider>
  );
}
