import React, { useEffect, useContext } from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  Platform,
  Image,
} from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
// import TribeText from 'src/assets/images/Tribe.svg';
// import AppText from 'src/components/AppText';
// import RGBLOGO from 'src/assets/images/RGB_Splash.gif'
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVString } from 'react-native-mmkv';

function Splash({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { setKey } = useContext(AppContext);
  const { mutate, data } = useMutation(ApiHandler.login);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);

  useEffect(() => {
    setTimeout(() => {
      init();
    }, 4000);
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
      if (pinMethod === PinMethod.DEFAULT) {
        mutate();
      } else {
        navigation.replace(NavigationRoutes.LOGIN);
      }
    } else {
      navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
    }
  };

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
        {/* <View style={styles.tribeImageWrapper}>
          <TribeText />
        </View>
        <View style={styles.textWrapper}>
          <AppText variant="body1" style={styles.textStyle}>
            {onBoarding.splashText}
          </AppText>
        </View> */}
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
    // tribeImageWrapper: {
    //   height: '100%',
    //   width: '100%',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    // },
    // textWrapper: {
    //   bottom: 20,
    // },
    // textStyle: {
    //   color: theme.colors.headingColor,
    // },
    splashImageStyle: {
      width: 500,
      height: 500,
    },
  });
export default Splash;
