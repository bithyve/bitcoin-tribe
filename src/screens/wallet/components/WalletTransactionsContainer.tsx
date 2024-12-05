import React, { useContext } from 'react';
import { Animated, FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';

import AppText from 'src/components/AppText';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import LoadingSpinner from 'src/components/LoadingSpinner';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ReservedSatsView from './ReservedSatsView';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import RefreshControlView from 'src/components/RefreshControlView';
import { windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import EmptyStateView from 'src/components/EmptyStateView';
import WalletTransactions from './WalletTransactions';
import AppType from 'src/models/enums/AppType';

function WalletTransactionsContainer({
  navigation,
  refreshing,
  transactions,
  wallet,
  pullDownToRefresh,
  autoRefresh,
  scrollY
}) {
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletStrings } = translations;

  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <View>
    <View style={styles.contentWrapper}>
      <AppText variant="body1" style={styles.recentTransText}>
        {walletStrings.recentTransaction}
      </AppText>
      <AppTouchable
        onPress={() =>
          navigation.navigate(NavigationRoutes.WALLETALLTRANSACTION, {
            transactions: transactions
             ,
            wallet,
          })
        }>
        <AppText variant="body1" style={styles.viewAllText}>
          {walletStrings.viewAll}
        </AppText>
      </AppTouchable>
    </View>
    <ReservedSatsView />
    {autoRefresh && !refreshing ? (
      <LoadingSpinner />
    ) : null}
    <FlatList
      data={transactions}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      )}
      refreshControl={
        Platform.OS === 'ios' ? (
          <RefreshControlView
            refreshing={refreshing}
            onRefresh={pullDownToRefresh}
          />
        ) : (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={ pullDownToRefresh}
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
          coin={null}
        />
      )}
      keyExtractor={item => item.txid}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          style={styles.emptyStateContainer}
          IllustartionImage={
            isThemeDark ? (
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
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recentTransText: {
      color: theme.colors.secondaryHeadingColor,
    },
    viewAllText: {
      color: theme.colors.accent1,
    },
    footer: {
      height: windowHeight > 670 ? 100 : 50, // Adjust the height as needed
    },
    emptyStateContainer: {
      marginTop: '20%',
    },
  });
export default WalletTransactionsContainer;
