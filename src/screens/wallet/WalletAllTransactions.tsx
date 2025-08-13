import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import WalletTransactionList from './components/WalletTransactionList';
import ReservedSatsView from './components/ReservedSatsView';
import useWallets from 'src/hooks/useWallets';

function WalletAllTransactions() {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const transactions = useWallets({}).wallets[0].specs.transactions;

  return (
    <ScreenContainer>
      <AppHeader title={walletTranslations.allTransactionsTitle} />
      <ReservedSatsView />
      <WalletTransactionList
        transactions={transactions}
      />
    </ScreenContainer>
  );
}
export default WalletAllTransactions;
