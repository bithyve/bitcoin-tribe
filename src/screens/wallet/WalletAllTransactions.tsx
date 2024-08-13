import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import WalletTransactionList from './components/WalletTransactionList';

function WalletAllTransactions({ route }) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const { transactions, wallet, coin } = route.params;

  return (
    <ScreenContainer>
      <AppHeader
        title={walletTranslations.allTransactionsTitle}
        // subTitle={walletTranslations.allTransactionSubTitle}
      />
      <WalletTransactionList
        transactions={transactions}
        wallet={wallet}
        coin={coin}
      />
    </ScreenContainer>
  );
}
export default WalletAllTransactions;
