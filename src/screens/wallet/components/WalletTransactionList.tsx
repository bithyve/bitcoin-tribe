import React, { useContext, useEffect } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import WalletTransactions from './WalletTransactions';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import RefreshControlView from 'src/components/RefreshControlView';
import { Keys } from 'src/storage';

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
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
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
      Toast(walletStrings.failRefreshWallet, true);
    }
  }, [walletRefreshMutation]);

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      refreshControl={
        Platform.OS === 'ios' ? (
          <RefreshControlView
            refreshing={walletRefreshMutation.isLoading}
            onRefresh={() => pullDownToRefresh()}
          />
        ) : (
          <RefreshControl
            refreshing={walletRefreshMutation.isLoading}
            onRefresh={() => pullDownToRefresh()}
            colors={[theme.colors.accent1]} // You can customize this part
            progressBackgroundColor={theme.colors.inputBackground}
          />
        )
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
          IllustartionImage={
            !isThemeDark ? (
              <NoTransactionIllustration />
            ) : (
              <NoTransactionIllustrationLight />
            )
          }
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
      marginTop: '30%',
    },
    refreshLoader: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
  });
export default WalletTransactionList;
