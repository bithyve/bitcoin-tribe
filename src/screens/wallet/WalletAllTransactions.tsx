import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import WalletTransactionList from './components/WalletTransactionList';

function WalletAllTransactions() {
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.allTransactionsTitle}
        subTitle={wallet.allTransactionSubTitle}
      />
      <WalletTransactionList />
    </ScreenContainer>
  );
}
export default WalletAllTransactions;
