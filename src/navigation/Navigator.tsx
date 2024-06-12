import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeTabs from './tabNavigation/HomeTabs';
import Splash from 'src/screens/splash/Splash';
import WalletSetupOption from 'src/screens/onBoarding/WalletSetupOption';
import ProfileSetup from 'src/screens/onBoarding/ProfileSetup';
import Settings from 'src/screens/settings/Settings';
import SendScreen from 'src/screens/onBoarding/SendScreen';
import { NavigationRoutes } from './NavigationRoutes';
import ReceiveScreen from 'src/screens/onBoarding/ReceiveScreen';

function Navigator() {
  const Stack = createNativeStackNavigator();

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
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
