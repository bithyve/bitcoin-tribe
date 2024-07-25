import React, { useEffect, useContext } from 'react';
import { Text } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';

function Splash({ navigation }) {
  const { setKey } = useContext(AppContext);
  const { mutate, data } = useMutation(ApiHandler.login);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const onLoginSuccess = async () => {
      if (data) {
        setKey(data);
        navigation.replace(NavigationRoutes.APPSTACK);
      }
    };
    onLoginSuccess();
  }, [data, navigation, setKey]);

  const init = async () => {
    const appId = Storage.get(Keys.APPID);
    if (appId) {
      const pinMethod = Storage.get(Keys.PIN_METHOD);
      if (pinMethod === PinMethod.DEFAULT) {
        mutate();
      }
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
