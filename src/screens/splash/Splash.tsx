import React, { useEffect } from 'react';
import { Text } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function Splash({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
    }, 500);
  });
  return (
    <ScreenContainer>
      <Text>Splash!</Text>
    </ScreenContainer>
  );
}
export default Splash;
