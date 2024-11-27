import React, { useContext, ReactNode, useState, useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ReactNativeBiometrics from 'react-native-biometrics';
import IconBackup from 'src/assets/images/icon_backup.svg';
import IconBackupLight from 'src/assets/images/icon_backup_light.svg';
import IconLangCurrency from 'src/assets/images/icon_globe1.svg';
import IconLangCurrencyLight from 'src/assets/images/icon_lang_light.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconAppInfoLight from 'src/assets/images/icon_info_light.svg';
// import IconNodes from 'src/assets/images/icon_node.svg';
// import IconNodesLight from 'src/assets/images/icon_node_light.svg';
import SetPasscode from 'src/assets/images/setPasscode.svg';
import SetPasscodeLight from 'src/assets/images/setPasscode_light.svg';
import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconBiometricLight from 'src/assets/images/icon_fingerprint_light.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import IconDarkModeLight from 'src/assets/images/icon_moon_light.svg';
import IconWalletSettings from 'src/assets/images/icon_wallet.svg';
import IconWalletSettingsLight from 'src/assets/images/icon_wallet_light.svg';
import IconNamePic from 'src/assets/images/icon_namePic.svg';
import IconNamePicLight from 'src/assets/images/icon_namePic_light.svg';
import IconChannelMgt from 'src/assets/images/channelMgt.svg';
import IconChannelMgtLight from 'src/assets/images/channelMgt_light.svg';
import IconViewNodeInfo from 'src/assets/images/viewNodeInfo.svg';
import IconNodeInfoLight from 'src/assets/images/viewNodeInfo_light.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import SettingMenuItem from './components/SettingMenuItem';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import Toast from 'src/components/Toast';
import * as SecureStore from 'src/storage/secure-store';
// import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';

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
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const { key } = useContext(AppContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

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
      icon: !isThemeDark ? <IconNamePic /> : <IconNamePicLight />,
      onPress: () => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE),
    },
    {
      id: 2,
      title: walletTranslation.walletSettings,
      icon: !isThemeDark ? <IconWalletSettings /> : <IconWalletSettingsLight />,
      onPress: () => navigation.navigate(NavigationRoutes.WALLETSETTINGS),
    },
    {
      id: 3,
      title: settings.appBackup,
      icon: !isThemeDark ? <IconBackup /> : <IconBackupLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
    },
    {
      id: 4,
      title: settings.langAndCurrency,
      icon: !isThemeDark ? <IconLangCurrency /> : <IconLangCurrencyLight />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      id: 5,
      title: settings.setPasscodeTitle,
      icon: !isThemeDark ? <SetPasscode /> : <SetPasscodeLight />,
      onPress: () => navigation.navigate(NavigationRoutes.CREATEPIN),
      hideMenu: pinMethod !== PinMethod.DEFAULT,
    },
    // TO DO - will implement theme functionality.  This commented temporarily
    {
      id: 6,
      title: settings.darkMode,
      icon: !isThemeDark ? <IconDarkMode /> : <IconDarkModeLight />,
      onValueChange: () => setDarkTheme(!darkTheme),
      toggleValue: !darkTheme,
      enableSwitch: true,
      testID: 'dark_mode',
      onPress: () => setDarkTheme(!darkTheme),
    },
    {
      id: 7,
      title: settings.biometricUnlock,
      icon: !isThemeDark ? <IconBiometric /> : <IconBiometricLight />,
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
    //   icon: !isThemeDark ? <IconNodes /> : <IconNodesLight/>,
    //   onPress: () => navigation.navigate(NavigationRoutes.NODESETTINGS),
    // },
    {
      id: 8,
      title: settings.appInfo,
      icon: !isThemeDark ? <IconAppInfo /> : <IconAppInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPINFO),
    },

    {
      id: 9,
      title: settings.viewNodeInfo,
      icon: !isThemeDark ? <IconViewNodeInfo /> : <IconNodeInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.VIEWNODEINFO),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
    {
      id: 10,
      title: settings.channelManagement,
      icon: !isThemeDark ? <IconChannelMgt /> : <IconChannelMgtLight />,
      onPress: () => navigation.navigate(NavigationRoutes.RGBCHANNELS),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
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
      marginTop: Platform.OS === 'ios' ? hp(10) : hp(30),
      marginBottom: hp(20),
    },
  });
export default SettingsScreen;
