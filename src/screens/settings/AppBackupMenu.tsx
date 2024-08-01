import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SettingMenuItem from './components/SettingMenuItem';
import { hp } from 'src/constants/responsive';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type AppBackupMenuProps = {
  title: string;
  onPress: () => void;
};

function AppBackupMenu({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [backup] = useMMKVBoolean(Keys.WALLET_BACKUP);

  const AppBackupMenu: AppBackupMenuProps[] = [
    {
      title: settings.walletBackup,
      onPress: () =>
        backup
          ? navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY)
          : navigation.navigate(NavigationRoutes.APPBACKUP),
    },
    {
      title: settings.rgbAssetsbackup,
      //   onPress: () => navigation.navigate(NavigationRoutes.APPBACKUP),
      onPress: () => {},
    },
    // Add more menu items as needed
  ];

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appBackup}
        subTitle={settings.appBackupMenuSubTitle}
        enableBack={true}
        style={styles.headerWrapper}
      />
      <SettingMenuItem SettingsMenu={AppBackupMenu} />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      marginBottom: hp(25),
    },
  });
export default AppBackupMenu;
