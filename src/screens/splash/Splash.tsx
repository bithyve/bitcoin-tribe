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
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

function Splash({ navigation }) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { setKey, setIsWalletOnline } = useContext(AppContext);
  const { mutate, data } = useMutation(ApiHandler.login);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);

  const onInit = useCallback(async () => {
    try {
      if (data) {
        setKey(data.key);
        setIsWalletOnline(data.isWalletOnline);
        navigation.replace(NavigationRoutes.APPSTACK);
      } else {
        const appId = await Storage.get(Keys.APPID);
        if (appId && pinMethod !== PinMethod.DEFAULT) {
          navigation.replace(NavigationRoutes.LOGIN);
        } else {
          navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
        }
      }
    } catch (error) {
      console.error('Error initializing app: ', error);
    }
  }, [mutate, navigation, pinMethod, data]);

  useEffect(() => {
    const init = async () => {
      try {
        const appId = await Storage.get(Keys.APPID);
        if (appId && pinMethod === PinMethod.DEFAULT) {
          console.log('mutate');
          mutate();
        }
      } catch (error) {
        console.error('Error fetching appId:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(onInit, 4500);
    return () => clearTimeout(timer);
  }, [onInit]);

  return (
    <ScreenContainer style={styles.container}>
      <ImageBackground
        source={
          !isThemeDark
            ? require('src/assets/images/background.png')
            : require('src/assets/images/backgroundLight.png')
        }
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
      width: 400,
      height: 400,
    },
  });
export default Splash;
