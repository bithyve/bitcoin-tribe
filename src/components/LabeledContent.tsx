import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';

type labelContentProps = {
  label: string;
  content: string;
  enableCurrency?: boolean;
};
function LabeledContent(props: labelContentProps) {
  const { label, content, enableCurrency } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;

  return (
    <View style={styles.wrapper}>
      <AppText variant="body1" style={styles.labelStyle}>
        {label}
      </AppText>
      {!enableCurrency ? (
        <AppText variant="body2" style={styles.textStyle}>
          {content}
        </AppText>
      ) : (
        <View style={styles.balanceWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS &&
            getCurrencyIcon(IconBitcoin, 'dark')}
          <AppText variant="body2" style={styles.textStyle}>
            &nbsp;{getBalance(content)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: hp(10),
    },
    labelStyle: {
      color: theme.colors.headingColor,
    },
    textStyle: {
      lineHeight: 20,
      color: theme.colors.secondaryHeadingColor,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    satsText: {
      color: theme.colors.secondaryHeadingColor,
      marginLeft: hp(5),
    },
  });
export default LabeledContent;
