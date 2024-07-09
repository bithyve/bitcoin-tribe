import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SendToContainer from './components/SendToContainer';

function SendToScreen() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  return (
    <ScreenContainer>
      <AppHeader title={sendScreen.sendToTitle} />
      <SendToContainer />
    </ScreenContainer>
  );
}
export default SendToScreen;
