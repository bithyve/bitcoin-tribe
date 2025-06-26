import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useQuery as realmUseQuery } from '@realm/react';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TransactionDetailsContainer from './components/TransactionDetailsContainer';
import { Transaction } from 'src/services/wallets/interfaces';
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { TransactionType } from 'src/services/wallets/enums';

function TransactionDetails({ route }) {
  const transaction: Transaction = route.params?.transaction;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];

  return (
    <ScreenContainer>
      <AppHeader title={wallet.transactionDetailTitle} />
      <TransactionDetailsContainer
        transAmount={
          app.appType === AppType.NODE_CONNECT
            ? `${transaction.received}`
            : transaction.transactionType ===  TransactionType.SENT ? `${transaction.amount - transaction.fee}` : transaction.amount
        }
        transaction={transaction}
      />
    </ScreenContainer>
  );
}
export default TransactionDetails;
