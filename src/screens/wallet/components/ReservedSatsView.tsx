import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import dbManager from 'src/storage/realm/dbManager';
import { AppTheme } from 'src/theme';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import ReserveAmtIcon from 'src/assets/images/reserveAmtIcon.svg';
import ReserveAmtIconLight from 'src/assets/images/reserveAmtIcon_light.svg';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';

function ReservedSatsView() {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const storedWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet);
  const UnspentUTXOData = storedWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );

  const totalReserveSatsAmount = useMemo(() => {
    return ApiHandler.calculateTotalReserveSatsAmount(UnspentUTXOData);
  }, [UnspentUTXOData]);

  return (
    <GradientView
      style={styles.reserveAmtWrapper}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.titleWrapper}>
        {!isThemeDark ? <ReserveAmtIcon /> : <ReserveAmtIconLight />}
        <AppText variant="caption" style={styles.titleText}>
          {walletTranslations.reserveAmtText}
        </AppText>
      </View>
      <View style={styles.amountWrapper}>
        <View style={styles.amtIconWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS &&
            getCurrencyIcon(
              !isThemeDark ? IconBitcoin : IconBitcoinLight,
              !isThemeDark ? 'dark' : 'light',
            )}
          <AppText variant="body1" style={[styles.amountText]}>
            &nbsp;{getBalance(totalReserveSatsAmount)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
      </View>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    reserveAmtWrapper: {
      flexDirection: 'row',
      height: hp(46),
      alignItems: 'center',
      borderRadius: hp(9),
      paddingHorizontal: hp(10),
      marginTop: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    amtIconWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    amountText: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    titleWrapper: {
      width: '60%',
      alignItems: 'center',
      flexDirection: 'row',
    },
    titleText: {
      marginLeft: hp(10),
      color: theme.colors.headingColor,
    },
    amountWrapper: {
      width: '40%',
      alignItems: 'flex-end',
    },
  });
export default ReservedSatsView;