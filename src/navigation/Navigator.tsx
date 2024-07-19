import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from 'src/screens/splash/Splash';
import WalletSetupOption from 'src/screens/onBoarding/WalletSetupOption';
import ProfileSetup from 'src/screens/onBoarding/ProfileSetup';
import Settings from 'src/screens/settings/Settings';
import SendScreen from 'src/screens/send/SendScreen';
import ReceiveScreen from 'src/screens/receive/ReceiveScreen';
import WalletDetails from 'src/screens/wallet/WalletDetails';
import AssetDetails from 'src/screens/home/AssetDetails';
import WalletAllTransactions from 'src/screens/wallet/WalletAllTransactions';
import TransactionDetails from 'src/screens/wallet/TransactionDetails';
import LanguageAndCurrency from 'src/screens/settings/LanguageAndCurrency';

import HomeTabs from './tabNavigation/HomeTabs';
import { NavigationRoutes } from './NavigationRoutes';
import { AppStackParams } from './types';
import WalletSettings from 'src/screens/wallet/WalletSettings';
import EditWalletProfile from 'src/screens/wallet/EditWalletProfile';
import AppBackup from 'src/screens/settings/AppBackup';
import ConnectionSettings from 'src/screens/settings/ConnectionSettings';
import NodeSettings from 'src/screens/settings/NodeSettings';
import ConnectNodeManually from 'src/screens/settings/ConnectNodeManually';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import IssueScreen from 'src/screens/collectiblesCoins/IssueScreen';
import ReceiveAsset from 'src/screens/receiveasset/ReceiveAssetScreen';
import SendToScreen from 'src/screens/send/SendToScreen';
import BroadcastTransaction from 'src/screens/send/BroadcastTransaction';
import ShowXPub from 'src/screens/wallet/ShowXPub';
import CoinDetails from 'src/screens/assets/CoinDetailsScreen';
import CoinMetaData from 'src/screens/assets/CoinsMetaDataScreen';
import SendAsset from 'src/screens/assets/SendAssetScreen';
import CoinsMetaData from 'src/screens/assets/CoinsMetaDataScreen';
import AppInfo from 'src/screens/settings/AppInfo';
import AppVersionHistory from 'src/screens/settings/AppVersionHistory';
import TransferDetails from 'src/screens/wallet/TransferDetails';
import CoinAllTransaction from 'src/screens/assets/CoinAllTransaction';

function LoginStack() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <Stack.Navigator
      initialRouteName={NavigationRoutes.SPLASH}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name={NavigationRoutes.SPLASH} component={Splash} />
      <Stack.Screen
        name={NavigationRoutes.WALLETSETUPOPTION}
        component={WalletSetupOption}
      />
      <Stack.Screen
        name={NavigationRoutes.PROFILESETUP}
        component={ProfileSetup}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <RealmProvider>
      <Stack.Navigator
        initialRouteName={NavigationRoutes.HOME}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name={NavigationRoutes.HOME} component={HomeTabs} />
        <Stack.Screen name={NavigationRoutes.SETTINGS} component={Settings} />
        <Stack.Screen
          name={NavigationRoutes.SENDSCREEN}
          component={SendScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.RECEIVESCREEN}
          component={ReceiveScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETDETAILS}
          component={WalletDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.ASSETDETAILS}
          component={AssetDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETALLTRANSACTION}
          component={WalletAllTransactions}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETSETTINGS}
          component={WalletSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.TRANSACTIONDETAILS}
          component={TransactionDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.LANGUAGEANDCURRENCY}
          component={LanguageAndCurrency}
        />
        <Stack.Screen
          name={NavigationRoutes.EDITWALLETPROFILE}
          component={EditWalletProfile}
        />
        <Stack.Screen name={NavigationRoutes.APPBACKUP} component={AppBackup} />
        <Stack.Screen
          name={NavigationRoutes.CONNECTIONSETTINGS}
          component={ConnectionSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.NODESETTINGS}
          component={NodeSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.CONNECTNODEMANUALLY}
          component={ConnectNodeManually}
        />
        <Stack.Screen
          name={NavigationRoutes.ISSUESCREEN}
          component={IssueScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.RECEIVEASSET}
          component={ReceiveAsset}
        />
        <Stack.Screen name={NavigationRoutes.SENDTO} component={SendToScreen} />
        <Stack.Screen
          name={NavigationRoutes.BROADCASTTRANSACTION}
          component={BroadcastTransaction}
        />
        <Stack.Screen name={NavigationRoutes.SHOWXPUB} component={ShowXPub} />
        <Stack.Screen
          name={NavigationRoutes.COINDETAILS}
          component={CoinDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.COINMETADATA}
          component={CoinMetaData}
        />
        <Stack.Screen name={NavigationRoutes.SENDASSET} component={SendAsset} />
        <Stack.Screen name={NavigationRoutes.APPINFO} component={AppInfo} />
        <Stack.Screen
          name={NavigationRoutes.APPVERSIONHISTORY}
          component={AppVersionHistory}
        />
        <Stack.Screen
          name={NavigationRoutes.TRANSFERDETAILS}
          component={TransferDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.COINALLTRANSACTION}
          component={CoinAllTransaction}
        />
      </Stack.Navigator>
    </RealmProvider>
  );
}
function Navigator() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={NavigationRoutes.LOGINSTACK}
          component={LoginStack}
        />
        <Stack.Screen name={NavigationRoutes.APPSTACK} component={AppStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
