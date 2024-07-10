import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import BroadcastTxnContainer from './components/BroadcastTxnContainer';

function BroadcastTransaction({ route }) {
  const { wallet, address, amount } = route.params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  return (
    <ScreenContainer>
      <AppHeader title={sendScreen.sendToTitle} />
      <BroadcastTxnContainer
        wallet={wallet}
        address={address}
        amount={amount}
      />
    </ScreenContainer>
  );
}
export default BroadcastTransaction;
