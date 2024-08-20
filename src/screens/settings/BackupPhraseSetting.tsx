import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import OptionCard from 'src/components/OptionCard';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';

function BackupPhraseSetting() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.backupPhraseSettingTitle}
        subTitle={settings.backupPhraseSettingSubTitle}
      />
      <OptionCard
        title={settings.viewBackupPhrase}
        subTitle={settings.viewBackupPhraseSubTitle}
        onPress={() => navigation.navigate(NavigationRoutes.APPBACKUP)}
      />
    </ScreenContainer>
  );
}
export default BackupPhraseSetting;
