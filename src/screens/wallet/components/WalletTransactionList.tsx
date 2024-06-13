import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
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
    transAmount: '0.129488',
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
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <FlatList
      style={styles.container}
      data={TransactionData}
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
    />
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      marginVertical: hp(5),
    },
  });
export default WalletTransactionList;
