import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';
import TransferDetailsContainer from './components/TransferDetailsContainer';

function TransferDetails({ route }) {
  const transaction: Transaction = route.params?.transaction;
  const coin = route.params?.coin;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader title={wallet.transferDetails} subTitle={coin} />
      <TransferDetailsContainer
        transAmount={`${transaction.amount}`}
        transaction={transaction}
      />
    </ScreenContainer>
  );
}
export default TransferDetails;
