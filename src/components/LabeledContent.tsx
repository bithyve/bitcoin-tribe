import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import GradientView from './GradientView';

type labelContentProps = {
  label: string;
  content: string;
  enableCurrency?: boolean;
};
function LabeledContent(props: labelContentProps) {
  const { label, content, enableCurrency } = props;
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
      <AppText variant="heading3" style={styles.labelStyle}>
        {label}
      </AppText>
      {!enableCurrency ? (
        <AppText variant="body2" style={styles.textStyle}>
          {content}
        </AppText>
      ) : (
        <View style={styles.balanceWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS &&
            getCurrencyIcon(
              isThemeDark ? IconBitcoin : IconBitcoinLight,
              isThemeDark ? 'dark' : 'light',
            )}
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
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: hp(10),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      padding: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
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
