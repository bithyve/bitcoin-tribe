import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import AppInfoContainer from './components/AppInfoContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';

function AppInfo({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { version }: VersionHistory = useQuery(RealmSchema.VersionHistory)[0];
  const { id } = app;

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appInfoTitle}
        subTitle={settings.appBackupScreenSubTitle}
      />
      <AppInfoContainer
        navigation={navigation}
        walletId={id}
        version={version}
      />
    </ScreenContainer>
  );
}
export default AppInfo;
