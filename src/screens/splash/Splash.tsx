import React, { useEffect, useContext, useCallback } from 'react';
import { StyleSheet, ImageBackground, Image } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { useMMKVString } from 'react-native-mmkv';

function Splash({ navigation }) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { setKey } = useContext(AppContext);
  const { mutate, data } = useMutation(ApiHandler.login);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);

  const init = useCallback(async () => {
    try {
      const appId = await Storage.get(Keys.APPID);
      if (appId) {
        if (pinMethod === PinMethod.DEFAULT) {
          mutate();
        } else {
          navigation.replace(NavigationRoutes.LOGIN);
        }
      } else {
        navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
      }
    } catch (error) {
      console.error('Error initializing app: ', error);
    }
  }, [mutate, navigation, pinMethod]);

  // Handle login success
  useEffect(() => {
    if (data) {
      setKey(data);
      navigation.replace(NavigationRoutes.APPSTACK);
    }
  }, [data, navigation, setKey]);

  // Trigger init after 4.5s
  useEffect(() => {
    const timer = setTimeout(init, 4500);
    return () => clearTimeout(timer);
  }, [init]);

  return (
    <ScreenContainer style={styles.container}>
      <ImageBackground
        source={require('src/assets/images/background.png')}
        resizeMode="cover"
        style={styles.backImage}>
        <Image
          source={require('src/assets/images/RGB_Splash.gif')}
          style={styles.splashImageStyle}
        />
      </ImageBackground>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 0,
      paddingBottom: 0,
      paddingTop: 0,
    },
    backImage: {
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    splashImageStyle: {
      width: 500,
      height: 500,
    },
  });
export default Splash;
