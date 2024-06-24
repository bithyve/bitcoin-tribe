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

function Navigator() {
  const Stack = createNativeStackNavigator<AppStackParams>();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={NavigationRoutes.SPLASH}>
        <Stack.Screen
          name={NavigationRoutes.SPLASH}
          component={Splash}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETSETUPOPTION}
          component={WalletSetupOption}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.PROFILESETUP}
          component={ProfileSetup}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.HOME}
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.SETTINGS}
          component={Settings}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.SENDSCREEN}
          component={SendScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.RECEIVESCREEN}
          component={ReceiveScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETDETAILS}
          component={WalletDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.ASSETDETAILS}
          component={AssetDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETALLTRANSACTION}
          component={WalletAllTransactions}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETSETTINGS}
          component={WalletSettings}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.TRANSACTIONDETAILS}
          component={TransactionDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.LANGUAGEANDCURRENCY}
          component={LanguageAndCurrency}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.EDITWALLETPROFILE}
          component={EditWalletProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NavigationRoutes.APPBACKUP}
          component={AppBackup}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
