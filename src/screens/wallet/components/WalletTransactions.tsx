import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
import IconArrow from 'src/assets/images/icon_arrowr1.svg';
import IconBitcoin from 'src/assets/images/icon_btc.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { TransactionType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import TransPendingIcon from 'src/assets/images/transaction_pending.svg';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
  backColor?: string;
  disabled?: boolean;
  transaction: Transaction;
};
function WalletTransactions(props: WalletTransactionsProps) {
  const navigation = useNavigation();
  const { transId, transDate, transAmount, transType, backColor, disabled } =
    props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);

  return (
    <AppTouchable
      disabled={disabled}
      style={styles.containerWrapper}
      onPress={() =>
        navigation.navigate(NavigationRoutes.TRANSACTIONDETAILS, {
          transaction: props.transaction,
        })
      }>
      <View style={styles.container}>
        <View style={styles.transDetailsWrapper}>
          <View>
            {transType === TransactionType.SENT ? (
              <SendTXNIcon />
            ) : (
              <RecieveTXNIcon />
            )}
            {props.transaction.confirmations === 0 ? (
              <View style={styles.transPendingWrapper}>
                <TransPendingIcon />
              </View>
            ) : null}
          </View>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {transId}
            </AppText>
            <AppText variant="body2" style={styles.transDateText}>
              {moment(transDate).format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <IconBitcoin />
            <AppText variant="body1" style={styles.amountText}>
              &nbsp;{numberWithCommas(transAmount)}
            </AppText>
          </View>
          {!disabled ? <IconArrow /> : null}
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    containerWrapper: {
      marginVertical: hp(15),
    },
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      backgroundColor: backColor,
      padding: backColor ? 15 : 0,
      borderRadius: backColor ? 10 : 0,
    },
    transDetailsWrapper: {
      flexDirection: 'row',
      width: '60%',
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
      width: '40%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    amtIconWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    amountText: {
      color: theme.colors.bodyColor,
      marginTop: hp(2),
    },
    transPendingWrapper: {
      top: -8,
      left: 0,
      position: 'absolute',
    },
  });
export default WalletTransactions;
