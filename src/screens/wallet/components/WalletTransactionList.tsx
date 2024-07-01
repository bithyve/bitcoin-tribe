import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';

function WalletTransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <FlatList
      style={styles.container}
      data={transactions}
      renderItem={({ item }) => (
        <WalletTransactions
          transId={item.txid}
          transDate={item.date}
          transAmount={`${item.amount}`}
          transType={item.transactionType}
          transaction={item}
        />
      )}
      keyExtractor={item => item.txid}
      showsVerticalScrollIndicator={false}
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
