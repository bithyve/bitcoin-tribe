import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import WalletTransactionList from './WalletTransactionList';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function WalletTransactionsContainer({ navigation }) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="heading3" style={styles.recentTransText}>
          Recent Transactions
        </AppText>
        <AppTouchable
          onPress={() =>
            navigation.navigate(NavigationRoutes.WALLETALLTRANSACTION)
          }>
          <AppText variant="smallCTA" style={styles.viewAllText}>
            VIEW ALL
          </AppText>
        </AppTouchable>
      </View>
      <WalletTransactionList />
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
export default WalletTransactionsContainer;
