import React, { useEffect } from 'react';
import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';

function Splash({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('WalletSetupOption');
    }, 2000);
  });
  return (
    <ScreenContainer>
      <Text>Splash!</Text>
    </ScreenContainer>
  );
}
export default Splash;
