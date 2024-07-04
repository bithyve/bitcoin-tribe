import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ConnectNodeManuallyContainer from './components/ConnectNodeManuallyContainer';

function ConnectNodeManually() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.connectYourNode}
        subTitle={settings.connectNodeManuallySubTitle}
      />
      <ConnectNodeManuallyContainer />
    </ScreenContainer>
  );
}
export default ConnectNodeManually;
