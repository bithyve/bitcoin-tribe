import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery as realmUseQuery } from '@realm/react';

import { hp, windowHeight } from 'src/constants/responsive';
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
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import LoadingSpinner from 'src/components/LoadingSpinner';

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
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const walletStrings = translations.wallet;
  const [refreshing, setRefreshing] = useState(false);

  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);

  const pullDownToRefresh = () => {
    setRefreshing(true);
    walletRefreshMutation.mutate({
      wallets: [wallet],
    });
    setTimeout(() => setRefreshing(false), 2000);
  };

  useEffect(() => {
    if (autoRefresh && isFocused) {
      walletRefreshMutation.mutate({
        wallets: [wallet],
      });
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

  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <View>
      {walletRefreshMutation.isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : null}
      <FlatList
        style={styles.container}
        data={transactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={refreshing}
              onRefresh={() => pullDownToRefresh()}
            />
          ) : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => pullDownToRefresh()}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        ListFooterComponent={FooterComponent}
        renderItem={({ item }) => (
          <WalletTransactions
            transId={item.txid}
            tranStatus={item.status}
            transDate={item.date}
            transAmount={
              app.appType === AppType.NODE_CONNECT
                ? `${item.received || item?.amtMsat / 1000}`
                : `${item.amount}`
            }
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
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '100%',
      marginVertical: hp(5),
    },
    emptyStateContainer: {
      marginTop: '20%',
    },
    refreshLoader: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
    footer: {
      height: windowHeight > 670 ? 100 : 50, // Adjust the height as needed
    },
  });
export default WalletTransactionList;
