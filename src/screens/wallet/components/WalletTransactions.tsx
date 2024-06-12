import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
};
function WalletTransactions(props: WalletTransactionsProps) {
  const { transId, transDate, transAmount, transType = 'send' } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.transDetailsWrapper}>
        {transType === 'send' ? <SendTXNIcon /> : <RecieveTXNIcon />}
        <View style={styles.contentWrapper}>
          <AppText
            variant="body1"
            testID="text_transId"
            style={styles.transIdText}>
            {transId}
          </AppText>
          <AppText
            variant="body2"
            testID="text_transDate"
            style={styles.transDateText}>
            {transDate}
          </AppText>
        </View>
      </View>
      <View style={styles.amountWrapper}>
        <View style={styles.amtIconWrapper}>
          <IconBitcoin />
          <AppText
            variant="body1"
            testID="text_transAmount"
            style={styles.amountText}>
            &nbsp;{transAmount}
          </AppText>
        </View>
        <IconArrow />
      </View>
    </View>
  );
}
const getStyles = theme =>
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
