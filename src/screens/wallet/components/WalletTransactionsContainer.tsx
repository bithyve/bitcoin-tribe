import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import WalletTransactionList from './WalletTransactionList';

function WalletTransactionsContainer() {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText
          variant="heading3"
          testID="text_recentTrans"
          style={styles.recentTransText}>
          Recent Transactions
        </AppText>
        <AppText
          variant="smallCTATitle"
          testID="text_viewAll"
          style={styles.viewAllText}>
          VIEW ALL
        </AppText>
      </View>
      <WalletTransactionList />
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      marginTop: hp(40),
      height: '50%',
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
