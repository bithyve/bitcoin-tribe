import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TransactionDetailsContainer from './components/TransactionDetailsContainer';
import { Transaction } from 'src/services/wallets/interfaces';

function TransactionDetails({ route }) {
  const transaction: Transaction = route.params?.transaction;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader title={wallet.transactionDetailTitle} />
      <TransactionDetailsContainer
        transId={transaction.txid}
        transDate={transaction.date}
        transAmount={`${transaction.amount}`}
        transType={transaction.transactionType}
        transaction={transaction}
      />
    </ScreenContainer>
  );
}
export default TransactionDetails;
