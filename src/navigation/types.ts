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
  // Add other routes as needed
};

// Usage:
// type ScreenProps = NativeStackScreenProps<AppStackParams, 'ScreenName'>;
// const ScreenName = ({ navigation, route }: ScreenProps) => {
