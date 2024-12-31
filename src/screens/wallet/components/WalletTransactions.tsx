import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
// import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
// import SendTXNIconLight from 'src/assets/images/icon_senttxn_light.svg';
// import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
// import RecieveTXNIconLight from 'src/assets/images/icon_recievedtxn_light.svg';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
// import { TransactionType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
// import TransPendingIcon from 'src/assets/images/transaction_pending.svg';
// import TransPendingIconLight from 'src/assets/images/transaction_pending_light.svg';
import Capitalize from 'src/utils/capitalizeUtils';
import GradientView from 'src/components/GradientView';
import useBalance from 'src/hooks/useBalance';
import { Keys } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import SentBtcIcon from 'src/assets/images/btcSentTxnIcon.svg';
import RecieveBtcIcon from 'src/assets/images/btcRecieveTxnIcon.svg';
import SentLightningIcon from 'src/assets/images/lightningSentTxnIcon.svg';
import RecieveLightningIcon from 'src/assets/images/lightningRecieveTxnIcon.svg';
import LightningPendingIcon from 'src/assets/images/lightningPendingTxnIcon.svg';
import BitcoinPendingIcon from 'src/assets/images/bitcoinPendingTxnIcon.svg'

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
  networkType?: string; 
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
    networkType
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const getStatusIcon = (status, type, isThemeDark, confirmations) => {
    const icons = {
      Sent: {
        bitcoin: {
          dark: <SentBtcIcon />,
          light: <SentBtcIcon />,
        },
        lightning: {
          dark: <SentLightningIcon />,
          light: <SentLightningIcon />,
        },
      },
      Received: {
        bitcoin: {
          dark: <RecieveBtcIcon />,
          light: <RecieveBtcIcon />,
        },
        lightning: {
          dark: <RecieveLightningIcon />,
          light: <RecieveLightningIcon />,
        },
      },
      TransPending: {
        bitcoin: {
          dark: <BitcoinPendingIcon />,
          light: <BitcoinPendingIcon />,
        },
        lightning: {
          dark: <LightningPendingIcon />,
          light: <LightningPendingIcon />,
        },
      },
      default: {
        bitcoin: {
          dark: <RecieveBtcIcon />,
          light: <RecieveBtcIcon />,
        },
        lightning: {
          dark: <RecieveLightningIcon />,
          light: <RecieveLightningIcon />,
        },
      },
    };

    const theme = isThemeDark ? 'dark' : 'light';
    const transactionType = type;

    if (confirmations === 0) {
      return icons.TransPending[transactionType]?.[theme];
    }

    return (
      icons[status]?.[transactionType]?.[theme] ||
      icons.default[transactionType]?.[theme]
    );
  };

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
            {getStatusIcon(
              transType,
              networkType,
              isThemeDark,
              props.transaction.confirmations,
            )}
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
            {initialCurrencyMode !== CurrencyKind.SATS &&
              getCurrencyIcon(
                isThemeDark ? IconBitcoin : IconBitcoinLight,
                isThemeDark ? 'dark' : 'light',
              )}
            <AppText
              variant="body1"
              style={[
                styles.amountText,
                {
                  fontSize: transAmount.toString().length > 10 ? 11 : 16,
                },
              ]}>
              &nbsp;{isNaN(transAmount) ? 0 : getBalance(transAmount)}
            </AppText>
            {initialCurrencyMode === CurrencyKind.SATS && (
              <AppText variant="caption" style={styles.satsText}>
                sats
              </AppText>
            )}
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
      width: '50%',
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
      width: '50%',
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
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
  });
export default WalletTransactions;
