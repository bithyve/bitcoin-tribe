import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from 'src/screens/Home/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function Navigator() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
