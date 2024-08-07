import React, { useContext, ReactNode, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

import IconBackup from 'src/assets/images/icon_backup.svg';
import IconLangCurrency from 'src/assets/images/icon_globe1.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconNodes from 'src/assets/images/icon_node.svg';
import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import SettingMenuContainer from './components/SettingMenuContainer';
import SettingMenuItem from './components/SettingMenuItem';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

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
};

function SettingsScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);

  const SettingsMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: settings.darkMode,
      icon: <IconDarkMode />,
      onValueChange: () => setDarkTheme(!darkTheme),
      toggleValue: !darkTheme,
      enableSwitch: true,
      testID: 'dark_mode',
    },
    {
      id: 2,
      title: settings.biometricUnlock,
      icon: <IconBiometric />,
      onValueChange: () => setBiometrics(!biometrics),
      toggleValue: !biometrics,
      enableSwitch: true,
      testID: 'biometric_unlock',
    },
    {
      id: 3,
      title: settings.langAndCurrency,
      icon: <IconLangCurrency />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      id: 4,
      title: settings.appBackup,
      icon: <IconBackup />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
    },
    {
      id: 5,
      title: settings.connectionSettings,
      icon: <IconNodes />,
      onPress: () => navigation.navigate(NavigationRoutes.CONNECTIONSETTINGS),
    },
    {
      id: 6,
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
      {/* <SettingMenuContainer /> */}
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
