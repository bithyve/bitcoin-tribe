import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
};
function WalletTransactions(props: WalletTransactionsProps) {
  const navigation = useNavigation();
  const { transId, transDate, transAmount, transType = 'send' } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <AppTouchable
      onPress={() => navigation.navigate(NavigationRoutes.TRANSACTIONDETAILS)}>
      <View style={styles.container}>
        <View style={styles.transDetailsWrapper}>
          {transType === 'send' ? <SendTXNIcon /> : <RecieveTXNIcon />}
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.transIdText}>
              {transId}
            </AppText>
            <AppText variant="body2" style={styles.transDateText}>
              {transDate}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <IconBitcoin />
            <AppText variant="body1" style={styles.amountText}>
              &nbsp;{transAmount}
            </AppText>
          </View>
          <IconArrow />
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    transDetailsWrapper: {
      flexDirection: 'row',
      width: '65%',
      alignItems: 'center',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    transIdText: {
      color: theme.colors.bodyColor,
    },
    transDateText: {
      color: theme.colors.bodyColor,
    },
    amountWrapper: {
      flexDirection: 'row',
      width: '35%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    amtIconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amountText: {
      color: theme.colors.bodyColor,
    },
  });
export default WalletTransactions;
