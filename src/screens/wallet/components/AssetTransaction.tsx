import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import SendTXNIcon from 'src/assets/images/icon_senttxn.svg';
import SendTXNIconLight from 'src/assets/images/icon_senttxn_light.svg';
import RecieveTXNIcon from 'src/assets/images/icon_recievedtxn.svg';
import RecieveTXNIconLight from 'src/assets/images/icon_recievedtxn_light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { RGBTransactionType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import TransPendingIcon from 'src/assets/images/transaction_pending.svg';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import Capitalize from 'src/utils/capitalizeUtils';
import { Keys } from 'src/storage';

type AssetTransactionProps = {
  transId: string;
  transDate: number;
  transAmount: string;
  transType: string;
  backColor?: string;
  disabled?: boolean;
  transaction: Transaction;
  coin: string;
};
function AssetTransaction(props: AssetTransactionProps) {
  const navigation = useNavigation();
  const {
    transId,
    transDate,
    transAmount,
    transType,
    backColor,
    disabled,
    transaction,
    coin,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <AppTouchable
      disabled={disabled}
      style={styles.containerWrapper}
      onPress={() => {
        navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
          transaction: transaction,
          coin: coin,
        });
      }}>
      <View style={styles.container}>
        <View style={styles.transDetailsWrapper}>
          <View>
            {props.transaction.confirmations === 0 ? (
              <TransPendingIcon />
            ) : transType.toUpperCase() === RGBTransactionType.SEND ? (
              !isThemeDark ? (
                <SendTXNIcon />
              ) : (
                <SendTXNIconLight />
              )
            ) : !isThemeDark ? (
              <RecieveTXNIcon />
            ) : (
              <RecieveTXNIconLight />
            )}
          </View>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {Capitalize(transId)}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment.unix(transDate).format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <AppText
              variant="body1"
              style={[
                styles.amountText,
                {
                  fontSize: transAmount.toString().length > 10 ? 11 : 16,
                },
              ]}>
              &nbsp;{numberWithCommas(transAmount)}
            </AppText>
          </View>
          {/* {!disabled ? <IconArrow /> : null} */}
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    containerWrapper: {
      paddingVertical: hp(15),
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
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
  });
export default AssetTransaction;
