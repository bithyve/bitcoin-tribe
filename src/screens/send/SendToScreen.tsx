import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SendToContainer from './components/SendToContainer';

function SendToScreen({ route }) {
  const { wallet, address, paymentURIAmount } = route.params;

  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  return (
    <ScreenContainer>
      <AppHeader title={sendScreen.sendToTitle} />
      <SendToContainer
        wallet={wallet}
        address={address}
        paymentURIAmount={paymentURIAmount}
      />
    </ScreenContainer>
  );
}
export default SendToScreen;
