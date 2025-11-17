import React, { useState } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';
import AppType from 'src/models/enums/AppType';
import { WalletOnlineStatus } from 'src/models/interfaces/RGBWallet';
import { Keys } from 'src/storage';
import { AppImageBackupStatusType } from 'src/components/AppImageBackupBanner';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
  isWalletOnline: WalletOnlineStatus.Null,
  setIsWalletOnline: status => {},
  reSyncWallet: (status: boolean) => {},
reSyncingWallet: false,
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
  isDisclaimerVisible: null,
  setIsDisclaimerVisible: status => {},
  isVerifyXInfoVisible: null,
  setIsVerifyXInfoVisible: status => {},
  isVerifyDomainInfoVisible: null,
  setIsVerifyDomainInfoVisible: status => {},
  communityStatus:null,
  setCommunityStatus:status=>{},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [isWalletOnline, setIsWalletOnline] = useState<WalletOnlineStatus>(WalletOnlineStatus.Null);
  const [resyncWallet, setResyncWallet] = useState<boolean>(false);
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
  const [isDisclaimerVisibleMMKV, setIsDisclaimerVisibleMMKV] = useMMKVBoolean(
    Keys.DISCLAIMER_VISIBILITY,
  );
  const isDisclaimerVisible = isDisclaimerVisibleMMKV ?? true;
  const [isVerifyXInfoVisibleMMKV, setIsVerifyXInfoVisibleMMKV] =
    useMMKVBoolean(Keys.VERIFY_TWITTER_INFO);
  const isVerifyXInfoVisible = isVerifyXInfoVisibleMMKV ?? true;
  const [isVerifyDomainInfoVisibleMMKV, setIsVerifyDomainInfoVisibleMMKV] =
    useMMKVBoolean(Keys.VERIFY_DOMAIN_INFO);
  const isVerifyDomainInfoVisible = isVerifyDomainInfoVisibleMMKV ?? true;
  const [communityStatus, setCommunityStatus] = useState(null);
  return (
    <AppContext.Provider
      value={{
        key,
        setKey: setKey,
        isWalletOnline,
        setIsWalletOnline: setIsWalletOnline,
        reSyncingWallet: resyncWallet,
        reSyncWallet: (status: boolean)=> setResyncWallet(status),
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
        isDisclaimerVisible,
        setIsDisclaimerVisible: setIsDisclaimerVisibleMMKV,
        isVerifyXInfoVisible,
        setIsVerifyXInfoVisible: setIsVerifyXInfoVisibleMMKV,
        isVerifyDomainInfoVisible,
        setIsVerifyDomainInfoVisible: setIsVerifyDomainInfoVisibleMMKV,
        communityStatus,
        setCommunityStatus:setCommunityStatus,
      }}>
      {children}
    </AppContext.Provider>
  );
}
