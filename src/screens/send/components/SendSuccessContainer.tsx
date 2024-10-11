import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';

import { AppTheme } from 'src/theme';
type sendSuccessProps = {
  transID: string;
  amount: string;
  transFee: number;
  total: number;
  onPress: () => void;
};
function SendSuccessContainer(props: sendSuccessProps) {
  const { transID, amount, transFee, total, onPress } = props;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.transactionID}
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText} numberOfLines={1}>
            {transID}
          </AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.amount}
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="body1" style={styles.valueText}>
            &nbsp;{getBalance(amount)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.transactionFee}
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="body1" style={styles.valueText}>
            &nbsp;{getBalance(transFee)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>Total</AppText>
        </View>
        <View style={styles.valueWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="body1" style={styles.valueText}>
            &nbsp;{getBalance(total)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.primaryCtaStyle}>
        <PrimaryCTA
          title={common.viewWallets}
          onPress={onPress}
          width={hp(200)}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {},
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(10),
    },
    labelWrapper: {
      width: '45%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '55%',
    },
    labelText: {
      color: theme.colors.popupText,
    },
    valueText: {
      color: theme.colors.popupText,
    },
    primaryCtaStyle: {
      marginTop: hp(30),
      alignSelf: 'center',
    },
    satsText: {
      color: theme.colors.popupText,
      marginTop: hp(5),
      marginLeft: hp(5),
    },
  });
export default SendSuccessContainer;
