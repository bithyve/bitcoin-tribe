import React, { useContext, useState, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useQuery, useQueryClient } from 'react-query';
import Toast from 'src/components/Toast';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function WalletTransactionList({
  transactions,
  wallet,
}: {
  transactions: Transaction[];
  wallet: Wallet;
}) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const walletStrings = translations.wallet;

  const [isWalletRefreshing, setIsWalletRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const refreshWalletQuery = useQuery(
    'refresh_wallet',
    async () => {
      // auto runs for the first time
      return await ApiHandler.refreshWallets({
        wallets: [wallet],
      });
    },
    {
      enabled: isWalletRefreshing, // Enable query only when refreshing
      onSettled: () => {
        // This callback is called on either success or error

        if (refreshWalletQuery.status === 'success') {
          Toast('Wallet refreshed successfully');
        } else if (refreshWalletQuery.status === 'error') {
          Toast('Failed to refresh wallet');
        }
        setIsWalletRefreshing(false);
      },
    },
  );

  const pullDownToRefresh = () => {
    setIsWalletRefreshing(true);
    queryClient.invalidateQueries('refresh_wallet'); // Invalidate the query to force a refresh
  };

  useEffect(() => {
    pullDownToRefresh(); // auto-refresh the wallet on mount
  }, []);

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      refreshing={isWalletRefreshing}
      onRefresh={pullDownToRefresh}
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
      ListEmptyComponent={
        <EmptyStateView
          title={walletStrings.noUTXOYet}
          subTitle={walletStrings.noUTXOYetSubTitle}
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
