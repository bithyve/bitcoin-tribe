import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  RefreshControl,
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

function TransactionsList({
  transactions,
  isLoading,
  refresh,
  navigation,
  wallet,
  coin,
  assetId = '',
}: {
  transactions: Transaction[];
  isLoading: boolean;
  refresh: () => void;
  navigation;
  wallet;
  coin: string;
  assetId: string;
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

      <FlatList
        style={styles.container2}
        data={transactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={isLoading}
              onRefresh={() => refresh()}
            />
          ) : (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refresh()}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AssetTransaction
            transId={settings[item.status.toLocaleLowerCase()]}
            transDate={item.createdAt}
            transAmount={`${item.amount}`}
            transType={item.kind}
            transaction={item}
            coin={coin}
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
      marginTop: hp(30),
      height: '100%',
    },
    container2: {
      // marginTop: hp(30),
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
