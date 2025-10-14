import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Transaction } from 'src/services/wallets/interfaces';
import GradientView from 'src/components/GradientView';
import useBalance from 'src/hooks/useBalance';
import { Keys } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import SentBtcIcon from 'src/assets/images/btcSentTxnIcon.svg';
import SentBtcIconLight from 'src/assets/images/btcSentTxnIcon_light.svg';
import RecieveBtcIcon from 'src/assets/images/btcReceiveTxnIcon.svg';
import RecieveBtcIconLight from 'src/assets/images/btcReceiveTxnIcon_light.svg';
import BitcoinPendingIcon from 'src/assets/images/bitcoinPendingTxnIcon.svg';
import SentLightningIcon from 'src/assets/images/lightningSentTxnIcon.svg';
import RecieveLightningIcon from 'src/assets/images/lightningReceiveTxnIcon.svg';
import LightningPendingIcon from 'src/assets/images/lightningPendingTxnIcon.svg';
import ServiceFeeIcon from 'src/assets/images/serviceFeeIcon.svg';
import ServiceFeeIconLight from 'src/assets/images/serviceFeeIcon_light.svg';
import { TransactionKind, TransactionType } from 'src/services/wallets/enums';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { SizedBox } from 'src/components/SizedBox';

type WalletTransactionsProps = {
  transId: string;
  transKind: TransactionKind;
  transDate: string;
  transAmount: string;
  transType: TransactionType;
  backColor?: string;
  disabled?: boolean;
  transaction: Transaction;
  tranStatus?: string;
  networkType?: string;
};
function WalletTransactions(props: WalletTransactionsProps) {
  const navigation = useNavigation();
  const {
    transId,
    transKind,
    transDate,
    transAmount,
    transType,
    backColor,
    disabled,
    networkType,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;

  const getStatusIcon = (status, type, isThemeDark, confirmations) => {
    const icons = {
      Sent: {
        bitcoin: {
          dark: <SentBtcIcon />,
          light: <SentBtcIconLight />,
        },
        lightning: {
          dark: <SentLightningIcon />,
          light: <SentLightningIcon />,
        },
      },
      Received: {
        bitcoin: {
          dark: <RecieveBtcIcon />,
          light: <RecieveBtcIconLight />,
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
        navigation.navigate(NavigationRoutes.TRANSACTIONDETAILS, {txid: props.transaction.txid})
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
            {transId === TransactionKind.SERVICE_FEE ? (
              isThemeDark ? (
                <ServiceFeeIcon />
              ) : (
                <ServiceFeeIconLight />
              )
            ) : (
              getStatusIcon(
                transType,
                networkType,
                isThemeDark,
                props.transaction.confirmations,
              )
            )}
          </View>
          <View style={styles.contentWrapper}>
          <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {transKind === TransactionKind.SERVICE_FEE
                ? assets.platformFeeTitle
                : transId}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment(transDate).format('DD MMM YY  •  hh:mm A')}
            </AppText>
          </View>
        </View>
        <SizedBox width={10}/>
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
                transType === TransactionType.SENT
                  ? styles.amountSend
                  : styles.amountTextReceive,
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
      flex:1,
      alignItems: 'center',
    },
    contentWrapper: {
      marginLeft: 10,
      flex:1
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
      justifyContent: 'space-between',
    },
    amtIconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    amountTextReceive: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    amountSend: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
  });
export default WalletTransactions;
