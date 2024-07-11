import React, { useContext } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Transaction } from 'src/models/interfaces/RGBWallet';
import EmptyStateView from 'src/components/EmptyStateView';
import AssetTransaction from '../wallet/components/AssetTransaction';

function TransactionsList({
  transactions,
  isLoading,
  refresh,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  refresh: () => void;
}) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="heading3" style={styles.recentTransText}>
          {walletTranslations.recentTransaction}
        </AppText>
        <AppTouchable onPress={() => {}}>
          <AppText variant="smallCTA" style={styles.viewAllText}>
            {walletTranslations.viewAll}
          </AppText>
        </AppTouchable>
      </View>

      <FlatList
        style={styles.container}
        data={transactions}
        refreshing={isLoading}
        onRefresh={() => refresh()}
        renderItem={({ item }) => (
          <AssetTransaction
            transId={item.status.toUpperCase()}
            transDate={item.createdAt}
            transAmount={`${item.amount}`}
            transType={item.kind}
            transaction={item}
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
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recentTransText: {
      color: theme.colors.bodyColor,
    },
    viewAllText: {
      color: theme.colors.accent1,
    },
  });
export default TransactionsList;
