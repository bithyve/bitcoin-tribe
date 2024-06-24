import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TransactionDetailsContainer from './components/TransactionDetailsContainer';

function TransactionDetails() {
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.transactionDetailTitle}
        subTitle={wallet.transactionDetailSubTitle}
      />
      <TransactionDetailsContainer
        transId={'f4184fc5964…1e9e16'}
        transDate="22 April 2024. 2:11 pm"
        transAmount="0.129483"
        transType="send"
      />
    </ScreenContainer>
  );
}
export default TransactionDetails;
