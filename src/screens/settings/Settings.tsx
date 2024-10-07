import React, { useContext, ReactNode, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ReactNativeBiometrics from 'react-native-biometrics';
import IconBackup from 'src/assets/images/icon_backup.svg';
import IconLangCurrency from 'src/assets/images/icon_globe1.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconNodes from 'src/assets/images/icon_node.svg';
import SetPasscode from 'src/assets/images/setPasscode.svg';
import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import IconWalletSettings from 'src/assets/images/icon_wallet.svg';
import IconNamePic from 'src/assets/images/icon_namePic.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import SettingMenuItem from './components/SettingMenuItem';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import Toast from 'src/components/Toast';
import * as SecureStore from 'src/storage/secure-store';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';

const RNBiometrics = new ReactNativeBiometrics();

type SettingMenuProps = {
  id: number;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onPress?: () => void;
  enableSwitch?: boolean;
  toggleValue?: boolean;
  onValueChange?: () => void;
  testID?: string;
  hideMenu?: boolean;
};

function SettingsScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings, onBoarding, wallet: walletTranslation } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const { key } = useContext(AppContext);

  useEffect(() => {
    if (pinMethod === PinMethod.BIOMETRIC) {
      setBiometrics(true);
    } else if (pinMethod === PinMethod.DEFAULT) {
      setBiometrics(false);
    }
  }, [pinMethod]);

  const enableBiometrics = async () => {
    try {
      const { available } = await RNBiometrics.isSensorAvailable();
      if (available) {
        const { keysExist } = await RNBiometrics.biometricKeysExist();
        if (keysExist) {
          await RNBiometrics.createKeys();
        }
        const { publicKey } = await RNBiometrics.createKeys();
        const { success } = await RNBiometrics.simplePrompt({
          promptMessage: 'Confirm your identity',
        });
        if (success) {
          await SecureStore.storeBiometricPubKey(publicKey);
          Storage.set(Keys.PIN_METHOD, PinMethod.BIOMETRIC);
        }
      } else {
        Toast(settings.biometricsNotEnableMsg, true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleBiometrics = () => {
    if (pinMethod === PinMethod.DEFAULT) {
      Toast(onBoarding.createPinFirst, true);
      navigation.navigate(NavigationRoutes.CREATEPIN, {
        OnBoarding: false,
      });
    } else if (pinMethod === PinMethod.PIN) {
      enableBiometrics();
    } else if (pinMethod === PinMethod.BIOMETRIC) {
      // resetPinMethod will be used in future - need ux or something else
      // ApiHandler.resetPinMethod(key);
      Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
      setBiometrics(false);
    }
  };

  const SettingsMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: walletTranslation.nameAndPic,
      icon: <IconNamePic />,
      onPress: () => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE),
    },
    {
      id: 2,
      title: walletTranslation.walletSettings,
      icon: <IconWalletSettings />,
      onPress: () => navigation.navigate(NavigationRoutes.WALLETSETTINGS),
    },
    {
      id: 3,
      title: settings.appBackup,
      icon: <IconBackup />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
    },
    {
      id: 4,
      title: settings.langAndCurrency,
      icon: <IconLangCurrency />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      id: 5,
      title: settings.setPasscodeTitle,
      icon: <SetPasscode />,
      onPress: () =>
        navigation.navigate(NavigationRoutes.CREATEPIN, {
          OnBoarding: false,
        }),
      hideMenu: pinMethod !== PinMethod.DEFAULT,
    },
    // TO DO - will implement theme functionality.  This commented temporarily
    // {
    //   id: 1,
    //   title: settings.darkMode,
    //   icon: <IconDarkMode />,
    //   onValueChange: () => setDarkTheme(!darkTheme),
    //   toggleValue: !darkTheme,
    //   enableSwitch: true,
    //   testID: 'dark_mode',
    //   onPress: () => setDarkTheme(!darkTheme),
    // },
    {
      id: 6,
      title: settings.biometricUnlock,
      icon: <IconBiometric />,
      onValueChange: toggleBiometrics,
      toggleValue: biometrics,
      enableSwitch: true,
      testID: 'biometric_unlock',
      onPress: toggleBiometrics,
    },

    // TO DO - will implement node setting functionality. This commented temporarily
    // {
    //   id: 5,
    //   title: settings.nodeSettings,
    //   icon: <IconNodes />,
    //   onPress: () => navigation.navigate(NavigationRoutes.NODESETTINGS),
    // },
    {
      id: 7,
      title: settings.appInfo,
      icon: <IconAppInfo />,
      onPress: () => navigation.navigate(NavigationRoutes.APPINFO),
    },
    // Add more menu items as needed
  ];

  return (
    <ScreenContainer>
      <AppText variant="pageTitle2" style={styles.title}>
        {settings.setting}
      </AppText>
      <SettingMenuItem SettingsMenu={SettingsMenu} />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.headingColor,
      marginTop: hp(40),
      marginBottom: hp(20),
    },
  });
export default SettingsScreen;
