import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import EnterSeedContainer from './components/EnterSeedContainer';

function EnterSeedScreen() {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader
        title={onBoarding.recoverAppTitle}
        subTitle={onBoarding.recoverAppSubTitle}
      />
      <EnterSeedContainer />
    </ScreenContainer>
  );
}
export default EnterSeedScreen;
