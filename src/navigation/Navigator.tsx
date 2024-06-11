import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeTabs from './tabNavigation/HomeTabs';
import Splash from 'src/screens/splash/Splash';
import WalletSetupOption from 'src/screens/onBoarding/WalletSetupOption';
import ProfileSetup from 'src/screens/onBoarding/ProfileSetup';
import Settings from 'src/screens/settings/Settings';

function Navigator() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WalletSetupOption"
          component={WalletSetupOption}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetup}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
