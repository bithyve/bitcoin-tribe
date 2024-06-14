import { NavigationRoutes } from './NavigationRoutes';

export type AppStackParams = {
  [NavigationRoutes.ASSETDETAILS]: undefined;
  [NavigationRoutes.ASSETS]: undefined;
  [NavigationRoutes.COMMUNITY]: undefined;
  [NavigationRoutes.HOME]: undefined;
  [NavigationRoutes.PROFILESETUP]: undefined;
  [NavigationRoutes.SETTINGS]: undefined;
  [NavigationRoutes.SPLASH]: undefined;
  [NavigationRoutes.WALLETDETAILS]: undefined;
  [NavigationRoutes.WALLETSETUPOPTION]: undefined;
  [NavigationRoutes.SENDSCREEN]: undefined;
  [NavigationRoutes.RECEIVESCREEN]: undefined;
  // Add other routes as needed
};

// Usage:
// type ScreenProps = NativeStackScreenProps<AppStackParams, 'ScreenName'>;
// const ScreenName = ({ navigation, route }: ScreenProps) => {
