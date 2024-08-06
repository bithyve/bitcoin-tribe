import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
import IconBitcoin from 'src/assets/images/icon_btc.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { TransactionType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import TransPendingIcon from 'src/assets/images/transaction_pending.svg';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import Capitalize from 'src/utils/capitalizeUtils';
import GradientView from 'src/components/GradientView';
import useBalance from 'src/hooks/useBalance';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
  backColor?: string;
  disabled?: boolean;
  transaction: Transaction;
  tranStatus?: string;
  coin?: string;
};
function WalletTransactions(props: WalletTransactionsProps) {
  const navigation = useNavigation();
  const {
    transId,
    transDate,
    transAmount,
    transType,
    backColor,
    disabled,
    tranStatus,
    coin,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);
  const { getBalance } = useBalance();
  return (
    <AppTouchable
      disabled={disabled}
      style={styles.containerWrapper}
      onPress={() =>
        tranStatus
          ? navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
              transaction: props.transaction,
              coin: coin,
            })
          : navigation.navigate(NavigationRoutes.TRANSACTIONDETAILS, {
              transaction: props.transaction,
            })
      }>
      <GradientView
        style={styles.container}
        colors={
          backColor
            ? [
                theme.colors.cardGradient1,
                theme.colors.cardGradient2,
                theme.colors.cardGradient3,
              ]
            : ['transparent', 'transparent', 'transparent']
        }>
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
              {tranStatus ? Capitalize(tranStatus) : transId}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment(transDate).format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <IconBitcoin />
            <AppText variant="body1" style={styles.amountText}>
              &nbsp;{getBalance(transAmount)}
            </AppText>
          </View>
          {/* {!disabled ? <IconArrow /> : null} */}
        </View>
      </GradientView>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    containerWrapper: {
      paddingVertical: hp(15),
      borderBottomColor: backColor ? '' : theme.colors.borderColor,
      borderBottomWidth: backColor ? 0 : 1,
    },
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      backgroundColor: backColor,
      paddingVertical: backColor ? hp(20) : 0,
      paddingHorizontal: backColor ? hp(15) : 0,
      borderRadius: backColor ? 10 : 0,
      borderColor: backColor ? theme.colors.borderColor : '',
      borderWidth: backColor ? 1 : 0,
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
      lineHeight: 25,
      color: theme.colors.headingColor,
    },
    transDateText: {
      color: theme.colors.secondaryHeadingColor,
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
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    transPendingWrapper: {
      top: -8,
      left: 0,
      position: 'absolute',
    },
  });
export default WalletTransactions;
