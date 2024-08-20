import { NavigationRoutes } from './NavigationRoutes';

export type AppStackParams = {
  [NavigationRoutes.LOGINSTACK]: undefined;
  [NavigationRoutes.APPSTACK]: undefined;
  [NavigationRoutes.ASSETDETAILS]: undefined;
  [NavigationRoutes.ASSETS]: undefined;
  [NavigationRoutes.COMMUNITY]: undefined;
  [NavigationRoutes.HOME]: undefined;
  [NavigationRoutes.PROFILESETUP]: undefined;
  [NavigationRoutes.SETTINGS]: undefined;
  [NavigationRoutes.SPLASH]: undefined;
  [NavigationRoutes.WALLETDETAILS]: undefined;
  [NavigationRoutes.WALLETSETUPOPTION]: undefined;
  [NavigationRoutes.WALLETALLTRANSACTION]: undefined;
  [NavigationRoutes.TRANSACTIONDETAILS]: undefined;
  [NavigationRoutes.SENDSCREEN]: undefined;
  [NavigationRoutes.RECEIVESCREEN]: undefined;
  [NavigationRoutes.LANGUAGEANDCURRENCY]: undefined;
  [NavigationRoutes.WALLETSETTINGS]: undefined;
  [NavigationRoutes.EDITWALLETPROFILE]: undefined;
  [NavigationRoutes.APPBACKUP]: undefined;
  [NavigationRoutes.CONNECTIONSETTINGS]: undefined;
  [NavigationRoutes.NODESETTINGS]: undefined;
  [NavigationRoutes.CONNECTNODEMANUALLY]: undefined;
  [NavigationRoutes.ISSUESCREEN]: undefined;
  [NavigationRoutes.RECEIVEASSET]: undefined;
  [NavigationRoutes.SENDTO]: undefined;
  [NavigationRoutes.BROADCASTTRANSACTION]: undefined;
  [NavigationRoutes.SHOWXPUB]: undefined;
  [NavigationRoutes.APPINFO]: undefined;
  [NavigationRoutes.SENDASSET]: undefined;
  [NavigationRoutes.COINMETADATA]: undefined;
  [NavigationRoutes.COINDETAILS]: undefined;
  [NavigationRoutes.APPVERSIONHISTORY]: undefined;
  [NavigationRoutes.TRANSFERDETAILS]: undefined;
  [NavigationRoutes.COINALLTRANSACTION]: undefined;
  [NavigationRoutes.VIEWUNSPENT]: undefined;
  [NavigationRoutes.CREATEPIN]: undefined;
  [NavigationRoutes.COLLECTIBLEDETAILS]: undefined;
  [NavigationRoutes.COLLECTIBLEMETADATA]: undefined;
  [NavigationRoutes.ADDASSET]: undefined;
  [NavigationRoutes.APPBACKUPMENU]: undefined;
  [NavigationRoutes.WALLETBACKUPHISTORY]: undefined;
  [NavigationRoutes.RGBCREATEUTXO]: undefined;
  [NavigationRoutes.BACKUPPHRASESETTING]: undefined;
  [NavigationRoutes.ENTERSEEDSCREEN]: undefined;
  [NavigationRoutes.LOGIN]: undefined;
  // Add other routes as needed
};

// Usage:
// type ScreenProps = NativeStackScreenProps<AppStackParams, 'ScreenName'>;
// const ScreenName = ({ navigation, route }: ScreenProps) => {
