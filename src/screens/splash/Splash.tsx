import React, { useEffect } from 'react';
import { Text } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function Splash({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate(NavigationRoutes.WALLETSETUPOPTION);
    }, 2000);
  });
  return (
    <ScreenContainer>
      <Text>Splash!</Text>
    </ScreenContainer>
  );
}
export default Splash;
