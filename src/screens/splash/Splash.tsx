import React, { useEffect, useContext } from 'react';
import { Text } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys, Storage } from 'src/storage';
import dbManager from 'src/storage/realm/dbManager';
import { stringToArrayBuffer } from 'src/utils/encryption';

function Splash({ navigation }) {
  const { setKey } = useContext(AppContext);

  useEffect(() => {
    setTimeout(async () => {
      init();
    }, 500);
  }, []);

  const init = async () => {
    const appId = Storage.get(Keys.APPID);
    if (appId) {
      setKey('key');
      const uint8array = stringToArrayBuffer('');
      const isInit = await dbManager.initializeRealm(uint8array);
      console.log('isInit', isInit);
      navigation.replace(NavigationRoutes.APPSTACK);
    } else {
      navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
    }
  };

  return (
    <ScreenContainer>
      <Text>Splash!</Text>
    </ScreenContainer>
  );
}
export default Splash;
