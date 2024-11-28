import React, { useContext } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import UserAvatar from 'src/components/UserAvatar';
import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc3_light.svg';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

type BtcWalletDetailsProps = {
  balances: string | number;
  username: string;
};

function BitcoinWalletDetailsCard(props: BtcWalletDetailsProps) {
  const { balances, username } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, home } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const styles = getStyles(theme);
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else if (initialCurrencyMode === CurrencyKind.BITCOIN) {
      setCurrencyMode(CurrencyKind.FIAT);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };
  return (
    <View style={styles.container}>
      {username && (
        <View style={styles.usernameWrapper}>
          <AppText variant="body1" style={styles.usernameText}>
            {username}
          </AppText>
        </View>
      )}
      <AppTouchable
        style={styles.balanceWrapper}
        onPress={() => toggleDisplayMode()}>
        {initialCurrencyMode !== CurrencyKind.SATS && (
          <View style={styles.currencyIconWrapper}>
            {getCurrencyIcon(
              !isThemeDark ? IconBitcoin : IconBitcoinLight,
              !isThemeDark ? 'dark' : 'light',
              30,
            )}
          </View>
        )}

        <AppText variant="walletBalance" style={styles.balanceText}>
          {getBalance(balances)}
        </AppText>
        {initialCurrencyMode === CurrencyKind.SATS && (
          <AppText variant="caption" style={styles.satsText}>
            sats
          </AppText>
        )}
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(15),
    },
    usernameWrapper: {
      marginBottom: hp(15),
      alignItems: 'center',
    },
    usernameText: {
      color: theme.colors.headingColor,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(10),
      marginLeft: hp(5),
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    currencyIconWrapper: {
      marginRight: hp(5),
    },
  });
export default BitcoinWalletDetailsCard;
