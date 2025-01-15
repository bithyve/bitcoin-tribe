import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  RefreshControl,
  Animated,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Transaction } from 'src/models/interfaces/RGBWallet';
import EmptyStateView from 'src/components/EmptyStateView';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import RefreshControlView from 'src/components/RefreshControlView';
import LoadingSpinner from 'src/components/LoadingSpinner';

function TransactionsList({
  transactions,
  isLoading,
  refresh,
  refreshingStatus,
  navigation,
  wallet,
  coin,
  assetId = '',
  scrollY,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  refresh: () => void;
  refreshingStatus?: boolean;
  navigation;
  wallet;
  coin: string;
  assetId: string;
  scrollY: any;
}) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="heading3" style={styles.recentTransText}>
          {walletTranslations.recentTransaction}
        </AppText>
        <AppTouchable
          onPress={() => {
            navigation.navigate(NavigationRoutes.COINALLTRANSACTION, {
              assetId: assetId,
              transactions: transactions,
            });
          }}>
          <AppText variant="body1" style={styles.viewAllText}>
            {walletTranslations.viewAll}
          </AppText>
        </AppTouchable>
      </View>
      {isLoading && !refreshingStatus ? <LoadingSpinner /> : null}
      <FlatList
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   { useNativeDriver: false },
        // )}
        style={styles.container2}
        data={transactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={refreshingStatus}
              onRefresh={() => refresh()}
            />
          ) : (
            <RefreshControl
              refreshing={refreshingStatus}
              onRefresh={() => refresh()}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AssetTransaction
            transId={settings[item.status.toLowerCase().replace(/_/g, '')]}
            transDate={item.createdAt}
            transAmount={`${item.amount}`}
            transType={item.kind}
            transaction={item}
            coin={coin}
            tranStatus={item.status}
          />
        )}
        keyExtractor={item => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyStateView title={''} subTitle={''} />}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '50%',
    },
    container2: {
      marginTop: hp(15),
      height: '100%',
    },
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
  });
export default TransactionsList;
