import React, { useContext, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
import { AppTheme } from 'src/theme';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
const TransactionData = [
  {
    id: 1,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:11 pm',
    transAmount: '0.129477',
    transType: 'send',
  },
  {
    id: 2,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.1294770000',
    transType: 'recieve',
  },
  {
    id: 3,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.129483',
    transType: 'send',
  },
  {
    id: 4,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.129483',
    transType: 'recieve',
  },
  {
    id: 5,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.129483',
    transType: 'send',
  },
  {
    id: 6,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.129483',
    transType: 'send',
  },
  {
    id: 7,
    transID: 'f4184fc5964…1e9e16',
    transDate: '22 April 2024. 2:00 pm',
    transAmount: '0.129483',
    transType: 'send',
  },
];
function WalletTransactionList() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const [refresh, setRefresh] = useState(false);
  return (
    <FlatList
      style={styles.container}
      data={[]}
      refreshing={refresh}
      onRefresh={() => setRefresh(false)}
      renderItem={({ item }) => (
        <WalletTransactions
          transId={item.transID}
          transDate={item.transDate}
          transAmount={item.transAmount}
          transType={item.transType}
        />
      )}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          title={wallet.noUTXOYet}
          subTitle={wallet.noUTXOYetSubTitle}
        />
      }
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(5),
    },
  });
export default WalletTransactionList;
