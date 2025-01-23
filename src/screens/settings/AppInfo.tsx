import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import { useQuery } from '@realm/react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import AppInfoContainer from './components/AppInfoContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';

function AppInfo({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  // const { version }: VersionHistory = useQuery(RealmSchema.VersionHistory)[0];
  const { publicId } = app;

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appInfoTitle}
        subTitle={settings.appInfoScreenSubTitle}
      />
      <AppInfoContainer
        navigation={navigation}
        walletId={publicId}
        version={`Tribe App ${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`}
      />
    </ScreenContainer>
  );
}
export default AppInfo;
