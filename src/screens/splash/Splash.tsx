import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import Realm from 'realm';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { ApiHandler } from 'src/services/handler/apiHandler';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmDatabase } from 'src/storage/realm/realm';

function Splash({ navigation }) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { setKey, setIsWalletOnline, setAppType } = useContext(AppContext);
  const { mutate, data } = useMutation(ApiHandler.login);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const appId = await Storage.get(Keys.APPID);
        if (appId && pinMethod === PinMethod.DEFAULT) {
          mutate();
        }
      } catch (error) {
        console.error('Error fetching appId:', error);
      }
    };
    init();
  }, []);

  const onInit = useCallback(async () => {
    try {
      const setupAppStatus = await Storage.get(Keys.SETUPAPP);
      const appId = await Storage.get(Keys.APPID);
      if (
        setupAppStatus ||
        setupAppStatus === undefined ||
        pinMethod === undefined
      ) {
        return navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
      }

      if (appId && pinMethod !== PinMethod.DEFAULT) {
        return navigation.replace(NavigationRoutes.LOGIN);
      }
    } catch (error) {
      console.error('Error initializing app: ', error);
    }
  }, [navigation, pinMethod, mutate]);

  // Handle login success
  const hasNavigated = useRef(false);
  useEffect(() => {
    if (!data || hasNavigated.current){};
    if (animationFinished) {
      if(!data?.key) {
        Realm.deleteFile({
          path: RealmDatabase.file
        })
        navigation.replace(NavigationRoutes.WALLETSETUPOPTION);
      } else {
        setKey(data.key);
        const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
        setIsWalletOnline(data.isWalletOnline);
        setAppType(app.appType);
        navigation.replace(NavigationRoutes.APPSTACK);
        hasNavigated.current = true;
      }

    }
  }, [data, animationFinished, navigation, setKey]);

  useEffect(() => {
    if (animationFinished) {
      onInit();
    }
  }, [animationFinished, onInit]);

  return (
    <ScreenContainer style={styles.container}>
      <ImageBackground
        source={
          isThemeDark
            ? require('src/assets/images/background.png')
            : require('src/assets/images/backgroundLight.png')
        }
        resizeMode="cover"
        style={styles.backImage}>
        <LottieView
          source={
            isThemeDark
              ? require('src/assets/images/jsons/logoAnimation.json')
              : require('src/assets/images/jsons/logoAnimation_light.json')
          }
          autoPlay
          loop={false}
          style={styles.splashImageStyle}
          onAnimationFinish={() => setAnimationFinished(true)}
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
