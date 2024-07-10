import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ShowXPubContainer from './components/ShowXPubContainer';

function ShowXPub() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.accountXPub}
        subTitle={wallet.accountXPubSubTitle}
        enableBack={true}
      />
      <ShowXPubContainer />
    </ScreenContainer>
  );
}
export default ShowXPub;
