import React, { useContext, ReactNode } from 'react';
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
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import SettingMenuContainer from './components/SettingMenuContainer';
import SettingMenuItem from './components/SettingMenuItem';

type SettingMenuProps = {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onPress: () => void;
};

function SettingsScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const SettingsMenu: SettingMenuProps[] = [
    {
      title: settings.langAndCurrency,
      // subtitle: settings.langAndCurrencySubTitle,
      icon: <IconLangCurrency />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      title: settings.appBackup,
      // subtitle: settings.appBackupSubTitle,
      icon: <IconBackup />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
    },
    {
      title: settings.connectionSettings,
      // subtitle: settings.connectionSettingSubTitle,
      icon: <IconNodes />,
      onPress: () => navigation.navigate(NavigationRoutes.CONNECTIONSETTINGS),
    },
    {
      title: settings.appInfo,
      // subtitle: settings.appInfoSubTitle,
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
      <SettingMenuContainer />
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
