import React, { useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useQuery as realmUseQuery, useQuery } from '@realm/react';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TransactionDetailsContainer from './components/TransactionDetailsContainer';
import { Transaction, } from 'src/services/wallets/interfaces';
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { TransactionType } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import { useNavigation } from '@react-navigation/native';

function TransactionDetails({ route }) {
  const transactions : Transaction[] = useQuery(RealmSchema.Wallet)[0].specs.transactions;
  const transaction: Transaction = transactions.find(t => t.txid === route.params?.txid);
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();

  useEffect(() => {
    if(!transaction) {
      Toast('Transaction not found. Please refresh your wallet.', true);
      navigation.goBack();
    }
  }, [transaction]);

  return (
    <ScreenContainer>
      <AppHeader title={wallet.transactionDetailTitle} />
      {transaction && (
      <TransactionDetailsContainer
        transAmount={
          app.appType === AppType.NODE_CONNECT ||
          app.appType === AppType.SUPPORTED_RLN
            ? `${transaction.received}`
            : transaction.transactionType === TransactionType.SENT
            ? `${transaction.amount - transaction.fee}`
            : transaction.amount
        }
          transaction={transaction}
        />
      )}
    </ScreenContainer>
  )
}
export default TransactionDetails;
