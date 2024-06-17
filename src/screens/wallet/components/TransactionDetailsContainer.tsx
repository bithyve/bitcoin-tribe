import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import WalletTransactions from './WalletTransactions';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
};

function TransactionDetailsContainer(props: WalletTransactionsProps) {
  const { transId, transDate, transAmount, transType } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View>
      <WalletTransactions
        transId={transId}
        transDate={transDate}
        transAmount={transAmount}
        transType={transType}
        backColor={theme.colors.cardBackground}
        disabled={true}
      />
      <View style={styles.transDetailsWrapper2}>
        <AppText variant="body1" style={styles.labelStyle}>
          {wallet.toAddress}
        </AppText>
        <AppText variant="body2" style={styles.textStyle}>
          1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71
        </AppText>
      </View>
      <View style={styles.transDetailsWrapper2}>
        <AppText variant="body1" style={styles.labelStyle}>
          {wallet.fromAddress}
        </AppText>
        <AppText variant="body2" style={styles.textStyle}>
          1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71
        </AppText>
      </View>
      <View style={styles.transDetailsWrapper2}>
        <AppText variant="body1" style={styles.labelStyle}>
          {wallet.fees}
        </AppText>
        <AppText variant="body2" style={styles.textStyle}>
          0.0001
        </AppText>
      </View>
      <View style={styles.transDetailsWrapper2}>
        <AppText variant="body1" style={styles.labelStyle}>
          {wallet.confirmations}
        </AppText>
        <AppText variant="body2" style={styles.textStyle}>
          6+
        </AppText>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    transContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(10),
      backgroundColor: theme.colors.cardBackground,
      padding: 10,
      borderRadius: 10,
    },
    transDetailsWrapper: {
      flexDirection: 'row',
      width: '65%',
      alignItems: 'center',
    },
    transDetailsWrapper2: {
      marginVertical: hp(10),
    },
    contentWrapper: {
      marginLeft: 10,
    },
    transIdText: {
      color: theme.colors.accent3,
    },
    transDateText: {
      color: theme.colors.accent3,
    },
    amountWrapper: {
      flexDirection: 'row',
      width: '35%',
      alignItems: 'center',
    },
    amtIconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amountText: {
      color: theme.colors.accent3,
    },
    labelStyle: {
      color: theme.colors.accent3,
    },
    textStyle: {
      color: theme.colors.bodyColor,
    },
  });
export default TransactionDetailsContainer;
