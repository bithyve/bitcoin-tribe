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
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
type sendSuccessProps = {
  recipientAddress: string;
  amount: string;
  transFee: number;
  total: number;
  feeRate: string;
  onPress: () => void;
};
function SendSuccessContainer(props: sendSuccessProps) {
  const { recipientAddress, amount, transFee, total, onPress, feeRate } = props;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations, sendScreen } = translations;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {sendScreen.recipientAddress}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>
            {recipientAddress}
          </AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.amount}:
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
            {sendScreen.feeRate}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>
            {feeRate} sat/vB
          </AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {sendScreen.feeAmount}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="body1" style={styles.valueText}>
            &nbsp;{app.appType === AppType.NODE_CONNECT? transFee : getBalance(transFee)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              {app.appType === AppType.NODE_CONNECT ? 'sats/vbyte' : 'sats'}
            </AppText>
          )}
        </View>
      </View>
      <View style={[styles.contentWrapper, styles.borderStyle]}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>{sendScreen.total}:</AppText>
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
          width={'100%'}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
          height={hp(14)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 1,
      paddingTop: 15,
    },
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
      // alignSelf: 'center',
    },
    satsText: {
      color: theme.colors.popupText,
      marginLeft: hp(5),
    },
    borderStyle:{
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 1,
      paddingTop: 15
    }
  });
export default SendSuccessContainer;
