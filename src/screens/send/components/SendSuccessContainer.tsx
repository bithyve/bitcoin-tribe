import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';
import LottieView from 'lottie-react-native';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import { AppTheme } from 'src/theme';
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import SwipeToAction from 'src/components/SwipeToAction';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { TxPriority } from 'src/services/wallets/enums';

type sendSuccessProps = {
  recipientAddress: string;
  amount: string;
  transFee: number;
  total: number;
  feeRate: string;
  estimateBlockTime: string;
  onPress: () => void;
  onSuccessStatus: boolean;
  onSuccessPress: () => void;
  selectedPriority: string;
};
function SendSuccessContainer(props: sendSuccessProps) {
  const {
    recipientAddress,
    amount,
    transFee,
    total,
    onPress,
    feeRate,
    estimateBlockTime,
    onSuccessStatus,
    onSuccessPress,
    selectedPriority,
  } = props;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations, sendScreen } = translations;

  return !onSuccessStatus ? (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {sendScreen.recipientAddress}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>{recipientAddress}</AppText>
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
            ? getCurrencyIcon(IconBitcoin, isThemeDark ? 'dark' : 'light')
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
          <AppText style={styles.labelText}>{sendScreen.feeRate}:</AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>
            {feeRate} sat/vB ~ {estimateBlockTime}{' '}
            {selectedPriority === TxPriority.CUSTOM ? 'min' : 'hr'}
          </AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>{sendScreen.feeAmount}:</AppText>
        </View>
        <View style={styles.valueWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, isThemeDark ? 'dark' : 'light')
            : null}
          <AppText variant="body1" style={styles.valueText}>
            &nbsp;
            {app.appType === AppType.NODE_CONNECT
              ? transFee
              : getBalance(transFee)}
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
        <SwipeToAction
          title={sendScreen.swipeToBroadcast}
          loadingTitle={sendScreen.broadcastingTXN}
          onSwipeComplete={onPress}
        />
      </View>
    </View>
  ) : (
    <>
      <LottieView
        source={require('src/assets/images/jsons/nodeConnectSuccess.json')}
        style={styles.loaderStyle}
        autoPlay
        loop
      />
      <PrimaryCTA
        title={common.done}
        onPress={onSuccessPress}
        width={'100%'}
        textColor={theme.colors.popupSentCTATitleColor}
        buttonColor={theme.colors.popupSentCTABackColor}
        height={hp(18)}
      />
    </>
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
      color: theme.colors.headingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    primaryCtaStyle: {
      marginTop: hp(30),
      // alignSelf: 'center',
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    borderStyle: {
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 1,
      paddingTop: 15,
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(150),
      height: hp(150),
      marginVertical: hp(20),
    },
    gestureRootView: {
      flex: 1,
    },
  });
export default SendSuccessContainer;
