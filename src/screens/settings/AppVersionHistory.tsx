import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function AppVersionHistory() {
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const theme: AppTheme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title={common.versionHistory}
        subTitle={settings.versionHistorySubTitle}
      />
    </ScreenContainer>
  );
}
export default AppVersionHistory;
