import React, { useContext, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import Toast from 'src/components/Toast';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';

function WalletTransactionList({
  transactions,
  wallet,
  coin,
  autoRefresh,
}: {
  transactions: Transaction[];
  wallet: Wallet;
  coin?: string;
  autoRefresh?: boolean;
}) {
  const isFocused = useIsFocused();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const walletStrings = translations.wallet;

  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);

  const pullDownToRefresh = () => {
    walletRefreshMutation.mutate({
      wallets: [wallet],
    });
  };

  useEffect(() => {
    if (autoRefresh && isFocused) {
      pullDownToRefresh();
    }
  }, [autoRefresh && isFocused]);

  // useEffect(() => {
  //   pullDownToRefresh(); // auto-refresh the wallet on mount
  // }, []);

  useEffect(() => {
    if (walletRefreshMutation.status === 'success') {
      // Toast(walletStrings.walletRefreshMsg, true);
    } else if (walletRefreshMutation.status === 'error') {
      Toast('Failed to refresh wallet', false, true);
    }
  }, [walletRefreshMutation]);

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      refreshControl={
        <RefreshControl
          refreshing={walletRefreshMutation.isLoading}
          onRefresh={pullDownToRefresh}
          tintColor={theme.colors.primaryCTA}
        />
      }
      renderItem={({ item }) => (
        <WalletTransactions
          transId={item.txid}
          tranStatus={item.status}
          transDate={item.date}
          transAmount={`${item.amount}`}
          transType={item.transactionType}
          transaction={item}
          coin={coin}
        />
      )}
      keyExtractor={item => item.txid}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          style={styles.emptyStateContainer}
          IllustartionImage={<NoTransactionIllustration />}
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
      height: '100%',
      marginVertical: hp(5),
    },
    emptyStateContainer: {
      marginTop: '50%',
    },
  });
export default WalletTransactionList;
