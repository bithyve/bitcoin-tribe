import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import moment from 'moment';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useBalance from 'src/hooks/useBalance';
import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc3_light.svg';
import GradientView from 'src/components/GradientView';
import AppTouchable from 'src/components/AppTouchable';

type transactionInfoSectionProps = {
  amount: string;
  txID: string;
  date: string;
  onIDPress: () => void;
};
function TransactionInfoSection(props: transactionInfoSectionProps) {
  const { amount, txID, date, onIDPress } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;

  return (
    <GradientView
      style={styles.wrapper}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.balanceWrapper}>
        {initialCurrencyMode !== CurrencyKind.SATS &&
          getCurrencyIcon(
            isThemeDark ? IconBitcoin : IconBitcoinLight,
            isThemeDark ? 'dark' : 'light',
            25,
          )}
        <AppText variant="heading1" style={styles.textStyle}>
          &nbsp;{getBalance(amount)}
        </AppText>
        {initialCurrencyMode === CurrencyKind.SATS && (
          <AppText variant="caption" style={styles.satsText}>
            sats
          </AppText>
        )}
      </View>
      <AppTouchable onPress={onIDPress}>
        <AppText variant="body2" style={styles.idTextStyle}>
          {txID}
        </AppText>
      </AppTouchable>
      <View>
        <AppText variant="caption" style={styles.dateTextStyle}>
          {moment(date).format('DD MMM YY  •  hh:mm A')}
        </AppText>
      </View>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: hp(10),
      width: '100%',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 20,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(15),
    },
    satsText: {
      color: theme.colors.secondaryHeadingColor,
      marginLeft: hp(5),
    },
    textStyle: {},
    idTextStyle: {
      color: theme.colors.txIDColor,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    dateTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      lineHeight: 30,
    },
  });
export default TransactionInfoSection;
