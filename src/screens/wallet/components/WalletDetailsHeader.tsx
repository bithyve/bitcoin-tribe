import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery as realmUseQuery } from '@realm/react';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TransactionButtons from './TransactionButtons';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import AppHeader from 'src/components/AppHeader';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import IconBitcoinOnChain from 'src/assets/images/icon_btc3.svg';
import IconBitcoinOnChainLight from 'src/assets/images/icon_btc3_light.svg';
import IconBTC from 'src/assets/images/icon_btc_new.svg';
import IconBTCLight from 'src/assets/images/icon_btc_new_light.svg';
import IconLightning from 'src/assets/images/icon_lightning_new.svg';
import AppTouchable from 'src/components/AppTouchable';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import useBalance from 'src/hooks/useBalance';
import AppText from 'src/components/AppText';

type walletDetailsHeaderProps = {
  username: string;
  wallet?: Wallet;
  rgbWallet?: RGBWallet;
  onPressSetting?: () => void;
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
  smallHeaderOpacity?: any;
  largeHeaderHeight?: any;
  totalAssetLocalAmount?: number;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const insets = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY);
  const initialCurrency = currency || 'USD';
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const styles = getStyles(theme, insets);
  const {
    username,
    wallet,
    rgbWallet,
    onPressSetting,
    onPressSend,
    onPressRecieve,
    onPressBuy,
    smallHeaderOpacity,
    largeHeaderHeight,
    totalAssetLocalAmount,
  } = props;

  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const balances = useMemo(() => {
    if (app.appType === AppType.NODE_CONNECT) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    } else {
      return (
        wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed
      );
    }
  }, [
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
  ]);

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else if (initialCurrencyMode === CurrencyKind.BITCOIN) {
      if (currency === undefined) {
        setCurrency(initialCurrency);
      }
      setCurrencyMode(CurrencyKind.FIAT);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };

  return (
    <>
      {/* <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}>
        <AppHeader title={username} />
      </Animated.View> */}
      <View
        // style={[styles.largeHeader, { height: largeHeaderHeight }]}
        style={styles.largeHeader}>
        <AppHeader title={username} />
        <View style={styles.largeHeaderContentWrapper}>
          {app.appType === AppType.NODE_CONNECT ? (
            <View style={styles.balanceContainer}>
              <AppTouchable
                style={styles.totalBalanceWrapper}
                onPress={() => toggleDisplayMode()}>
                <View style={styles.totalBalanceWrapper1}>
                  {initialCurrencyMode !== CurrencyKind.SATS && (
                    <View style={styles.currencyIconWrapper}>
                      {getCurrencyIcon(
                        isThemeDark ? IconBitcoin : IconBitcoinLight,
                        isThemeDark ? 'dark' : 'light',
                        10,
                      )}
                    </View>
                  )}

                  <AppText variant="heading2" style={styles.totalBalance}>
                    {getBalance(balances)}
                  </AppText>
                  {initialCurrencyMode === CurrencyKind.SATS && (
                    <AppText variant="caption" style={styles.satsText}>
                      sats
                    </AppText>
                  )}
                </View>
                <AppText variant="body1" style={styles.totalBalanceLabel}>
                  {home.totalBalance}
                </AppText>
              </AppTouchable>
              <View style={styles.modeBalanceWrapper}>
                <View style={styles.balanceWrapper}>
                  <View style={styles.currencyIconWrapper}>
                    {isThemeDark ? <IconBTC /> : <IconBTCLight />}
                  </View>
                  <View style={styles.totalBalanceWrapper1}>
                    {initialCurrencyMode !== CurrencyKind.SATS && (
                      <View style={styles.currencyIconWrapper}>
                        {getCurrencyIcon(
                          isThemeDark ? IconBitcoin : IconBitcoinLight,
                          isThemeDark ? 'dark' : 'light',
                          10,
                        )}
                      </View>
                    )}

                    <AppText variant="heading3" style={styles.totalBalance}>
                      {getBalance(balances)}
                    </AppText>
                    {initialCurrencyMode === CurrencyKind.SATS && (
                      <AppText variant="caption" style={styles.satsText}>
                        sats
                      </AppText>
                    )}
                  </View>
                  {/* <AppText variant="heading3" style={styles.balanceText}>
                    {balances}
                  </AppText> */}
                </View>
                <View style={styles.balanceWrapper}>
                  <View style={styles.currencyIconWrapper}>
                    <IconLightning />
                  </View>
                  <View style={styles.totalBalanceWrapper1}>
                    {initialCurrencyMode !== CurrencyKind.SATS && (
                      <View style={styles.currencyIconWrapper}>
                        {getCurrencyIcon(
                          isThemeDark ? IconBitcoin : IconBitcoinLight,
                          isThemeDark ? 'dark' : 'light',
                          10,
                        )}
                      </View>
                    )}

                    <AppText variant="heading3" style={styles.totalBalance}>
                      {getBalance(totalAssetLocalAmount)}
                    </AppText>
                    {initialCurrencyMode === CurrencyKind.SATS && (
                      <AppText variant="caption" style={styles.satsText}>
                        sats
                      </AppText>
                    )}
                  </View>
                  {/* <AppText variant="heading3" style={styles.balanceText}>
                    0.000
                  </AppText> */}
                </View>
              </View>
            </View>
          ) : (
            <View>
              <AppTouchable
                style={styles.onChainTotalBalanceWrapper}
                onPress={() => toggleDisplayMode()}>
                <View style={styles.totalBalanceWrapper1}>
                  {initialCurrencyMode !== CurrencyKind.SATS && (
                    <View style={styles.currencyIconWrapper}>
                      {getCurrencyIcon(
                        isThemeDark
                          ? IconBitcoinOnChain
                          : IconBitcoinOnChainLight,
                        isThemeDark ? 'dark' : 'light',
                        25,
                      )}
                    </View>
                  )}

                  <AppText variant="pageTitle2" style={styles.totalBalance}>
                    {getBalance(balances)}
                  </AppText>
                  {initialCurrencyMode === CurrencyKind.SATS && (
                    <AppText variant="caption" style={styles.satsText}>
                      sats
                    </AppText>
                  )}
                </View>
                <AppText variant="body1" style={styles.totalBalanceLabel}>
                  {home.totalBalance}
                </AppText>
              </AppTouchable>
            </View>
          )}
          <View style={styles.transCtaWrapper}>
            <TransactionButtons
              onPressSend={onPressSend}
              onPressRecieve={onPressRecieve}
              onPressBuy={onPressBuy}
            />
          </View>
        </View>
      </View>
    </>
  );
}
const getStyles = (theme: AppTheme, insets) =>
  StyleSheet.create({
    smallHeader: {
      position: 'absolute',
      top: insets.top,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
      paddingHorizontal: hp(16),
      backgroundColor: theme.colors.primaryBackground,
    },
    largeHeader: {
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: hp(15),
    },
    largeHeaderContentWrapper: {
      paddingHorizontal: hp(10),
      paddingVertical: hp(20),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      width: '100%',
      borderRadius: 15,
    },
    totalBalance: {
      color: theme.colors.headingColor,
    },
    totalBalanceLabel: {
      color: theme.colors.secondaryHeadingColor,
    },
    balanceText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    balanceContainer: {
      flexDirection: 'row',
      width: '100%',
    },
    totalBalanceWrapper: {
      width: '50%',
      borderRightWidth: 2,
      borderRightColor: theme.colors.borderColor,
      alignItems: 'center',
    },
    totalBalanceWrapper1: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    onChainTotalBalanceWrapper: {
      alignItems: 'center',
    },
    modeBalanceWrapper: {
      width: '50%',
      alignItems: 'center',
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currencyIconWrapper: {
      marginRight: hp(5),
    },
    satsText: {
      color: theme.colors.headingColor,
      // marginTop: hp(10),
      marginLeft: hp(5),
    },
    transCtaWrapper: {
      marginTop: hp(15),
      alignItems: 'center',
    },
  });
export default WalletDetailsHeader;
