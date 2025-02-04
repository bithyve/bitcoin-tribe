import React, { useContext, ReactNode, useState, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import ReactNativeBiometrics from 'react-native-biometrics';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
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
import SettingMenuItem from './components/SettingMenuItem';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import Toast from 'src/components/Toast';
import * as SecureStore from 'src/storage/secure-store';
// import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import SocialLinks from './components/SocialLinks';
import openLink from 'src/utils/OpenLink';
import { hp } from 'src/constants/responsive';

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
  const [isEnableBiometrics, setIsEnableBiometrics] = useState(false);
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

  useEffect(() => {
    if (isEnableBiometrics && pinMethod === PinMethod.PIN) {
      enableBiometrics();
    }
  }, [isEnableBiometrics, pinMethod]);

  const toggleBiometrics = () => {
    if (pinMethod === PinMethod.DEFAULT) {
      setIsEnableBiometrics(true);
      navigation.navigate(NavigationRoutes.CREATEPIN, {
        biometricProcess: true,
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
      icon: isThemeDark ? <IconNamePic /> : <IconNamePicLight />,
      onPress: () => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE),
    },
    {
      id: 2,
      title: walletTranslation.walletSettings,
      icon: isThemeDark ? <IconWalletSettings /> : <IconWalletSettingsLight />,
      onPress: () => navigation.navigate(NavigationRoutes.WALLETSETTINGS),
    },
    {
      id: 3,
      title: settings.appBackup,
      icon: isThemeDark ? <IconBackup /> : <IconBackupLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
    },
    {
      id: 4,
      title: settings.langAndCurrency,
      icon: isThemeDark ? <IconLangCurrency /> : <IconLangCurrencyLight />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      id: 5,
      title: settings.viewNodeInfo,
      icon: isThemeDark ? <IconViewNodeInfo /> : <IconNodeInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.VIEWNODEINFO),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
    {
      id: 6,
      title: settings.setPasscodeTitle,
      icon: isThemeDark ? <SetPasscode /> : <SetPasscodeLight />,
      onPress: () =>
        navigation.navigate(NavigationRoutes.CREATEPIN, {
          biometricProcess: false,
        }),
      hideMenu: pinMethod !== PinMethod.DEFAULT,
    },
    {
      id: 7,
      title: settings.channelManagement,
      icon: isThemeDark ? <IconChannelMgt /> : <IconChannelMgtLight />,
      onPress: () => navigation.navigate(NavigationRoutes.RGBCHANNELS),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
    {
      id: 8,
      title: settings.darkMode,
      icon: isThemeDark ? <IconDarkMode /> : <IconDarkModeLight />,
      onValueChange: () => {
        setDarkTheme(!darkTheme);
      },
      toggleValue: darkTheme,
      enableSwitch: true,
      testID: 'dark_mode',
      onPress: () => setDarkTheme(!darkTheme),
    },
    {
      id: 9,
      title: settings.biometricUnlock,
      icon: isThemeDark ? <IconBiometric /> : <IconBiometricLight />,
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
    //   icon: isThemeDark ? <IconNodes /> : <IconNodesLight/>,
    //   onPress: () => navigation.navigate(NavigationRoutes.NODESETTINGS),
    // },
    {
      id: 10,
      title: settings.appInfo,
      icon: isThemeDark ? <IconAppInfo /> : <IconAppInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPINFO),
    },
  ];
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <SettingMenuItem SettingsMenu={SettingsMenu} />
      </View>
      <View style={styles.container1}>
        <SocialLinks
          onPressTelegram={() => {
            openLink('https://t.me/BitcoinTribeSupport');
          }}
          onPressX={() => {
            openLink(
              'https://x.com/BitcoinTribe_?t=QxwE3_ZHsQfx_sD2swKsgw&s=09',
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: Platform.OS === 'ios' ? '83%' : '80%',
      paddingTop: Platform.OS === 'ios' ? hp(20) : hp(30),
    },
    container1: {
      height: Platform.OS === 'ios' ? '17%' : '20%',
      justifyContent: 'flex-end',
      paddingTop: hp(20),
    },
  });
export default SettingsScreen;
