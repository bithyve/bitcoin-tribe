import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import BackupHistoryList from './components/BackupHistoryList';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function WalletBackupHistory({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.walletBackupHistory}
        subTitle={settings.walletBackupHistorySubTitle}
        rightIcon={<SettingIcon />}
        onBackNavigation={() =>
          navigation.navigate(NavigationRoutes.APPBACKUPMENU)
        }
        onSettingsPress={() => navigation.navigate(NavigationRoutes.APPBACKUP)}
      />
      <BackupHistoryList />
    </ScreenContainer>
  );
}
export default WalletBackupHistory;
