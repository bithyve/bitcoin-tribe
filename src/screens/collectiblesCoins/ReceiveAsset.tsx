import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ReceiveAssetContainer from './components/ReceiveAssetContainer';

function ReceiveAsset() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  return (
    <ScreenContainer>
      <AppHeader title={common.receive} />
      <ReceiveAssetContainer />
    </ScreenContainer>
  );
}
export default ReceiveAsset;
