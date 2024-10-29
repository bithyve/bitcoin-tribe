import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import WalletTransactionList from './WalletTransactionList';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ReservedSatsView from './ReservedSatsView';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from '@realm/react';
import AppType from 'src/models/enums/AppType';

function WalletTransactionsContainer({
  navigation,
  transactions,
  wallet,
  autoRefresh,
  activeTab,
}) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;

  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="body1" style={styles.recentTransText}>
          {walletTranslations.recentTransaction}
        </AppText>
        <AppTouchable
          onPress={() =>
            navigation.navigate(NavigationRoutes.WALLETALLTRANSACTION, {
              transactions,
              wallet,
            })
          }>
          <AppText variant="body1" style={styles.viewAllText}>
            {walletTranslations.viewAll}
          </AppText>
        </AppTouchable>
      </View>
      {activeTab === 'bitcoin' ? <ReservedSatsView /> : null}
      <WalletTransactionList
        transactions={transactions}
        wallet={wallet}
        autoRefresh={autoRefresh}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {},
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
export default WalletTransactionsContainer;
