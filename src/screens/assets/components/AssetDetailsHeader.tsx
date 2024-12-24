import React, { useContext } from 'react';
import { View, StyleSheet, Animated, Image, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Identicon from 'react-native-identicon';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { AssetFace, Coin, Collectible } from 'src/models/interfaces/RGBWallet';
import AppHeader from 'src/components/AppHeader';
import GradientView from 'src/components/GradientView';
import IconBTC from 'src/assets/images/icon_btc_new.svg';
import IconLightning from 'src/assets/images/icon_lightning_new.svg';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import TransactionButtons from 'src/screens/wallet/components/TransactionButtons';
import InfoIcon from 'src/assets/images/infoIcon.svg';

type assetDetailsHeaderProps = {
  assetName: string;
  asset?: Coin | Collectible;
  assetImage?: string;
  assetTicker?: string;
  onPressSetting?: () => void;
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
  smallHeaderOpacity: any;
  largeHeaderHeight: any;
  headerRightIcon?: React.ReactNode;
};
function AssetDetailsHeader(props: assetDetailsHeaderProps) {
  const {
    assetName,
    asset,
    assetTicker,
    assetImage,
    onPressSetting,
    onPressSend,
    onPressRecieve,
    onPressBuy,
    smallHeaderOpacity,
    largeHeaderHeight,
    headerRightIcon
  } = props;
  const insets = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const combinedBalance = asset.balance.spendable + asset.balance?.offchainOutbound || 0;
  const lengthOfTotalBalance = combinedBalance.toString().length;
  const styles = getStyles(theme, insets,lengthOfTotalBalance);
  
  return (
    <>
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}>
        <AppHeader title={assetTicker} rightIcon={headerRightIcon}/>
      </Animated.View>
      <Animated.View
        style={[styles.largeHeader, { height: largeHeaderHeight }]}>
        <AppHeader
          title={assetTicker}
          rightIcon={<InfoIcon/>}
          onSettingsPress={onPressSetting}
        />
        <View style={styles.largeHeaderContainer}>
          <GradientView
            style={styles.largeHeaderContentWrapper}
            colors={[
              theme.colors.cardGradient2,
              theme.colors.cardGradient2,
              theme.colors.cardGradient2,
            ]}>
            <View style={styles.assetImageWrapper}>
              {asset.assetIface.toUpperCase() === AssetFace.RGB25 ? (
                <Image
                  source={{
                    uri: Platform.select({
                      android: `file://${assetImage}`,
                      ios: assetImage,
                    }),
                  }}
                  style={styles.imageStyle}
                />
              ) : (
                <View style={styles.identiconWrapper}>
                  <View style={styles.identiconWrapper2}>
                    <Identicon
                      value={asset.assetId}
                      style={styles.identiconView}
                      size={60}
                    />
                  </View>
                </View>
              )}
            </View>
            <AppText variant="body2" style={styles.assetNameText}>
              {assetName}
            </AppText>
            <View style={styles.balanceContainer}>
              <View style={styles.totalBalanceWrapper}>
                <AppText variant="heading2" style={styles.totalBalance}>
                  {numberWithCommas(
                    asset.balance.spendable + asset.balance?.offchainOutbound,
                  )}
                </AppText>
                <AppText variant="body1" style={styles.totalBalanceLabel}>
                  {home.totalBalance}
                </AppText>
              </View>
              <View style={styles.modeBalanceWrapper}>
                <View style={styles.balanceWrapper}>
                  <IconBTC />
                  <AppText variant="heading3" style={styles.balanceText}>
                    0.0000
                  </AppText>
                </View>
                <View style={styles.balanceWrapper}>
                  <IconLightning />
                  <AppText variant="heading3" style={styles.balanceText}>
                    0.0000
                  </AppText>
                </View>
              </View>
            </View>
            <View style={styles.transCtaWrapper}>
              <TransactionButtons
                onPressSend={onPressSend}
                onPressRecieve={onPressRecieve}
                onPressBuy={onPressBuy}
              />
            </View>
          </GradientView>
        </View>
      </Animated.View>
    </>
  );
}
const getStyles = (theme: AppTheme, insets, lengthOfTotalBalance) =>
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
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      padding: hp(5),
    },
    largeHeaderContentWrapper: {
      paddingHorizontal: hp(10),
      paddingVertical: hp(15),
      width: '100%',
      borderRadius: hp(20),
      overflow: 'visible',
      position: 'relative',
    },
    totalBalance: {
      color: theme.colors.headingColor,
      fontSize: lengthOfTotalBalance > 15 ? 13 : 20
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
    imageStyle: {
      alignSelf: 'center',
      top: -50,
      zIndex: 999,
      width: 60,
      height: 60,
      borderRadius: 60,
      backgroundColor: theme.colors.inputBackground,
    },
    identiconWrapper: {
      top: -50,
      zIndex: 999,
      alignSelf: 'center',
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
    },
    identiconView: {
      height: 60,
      width: 60,
      borderRadius: 60,
    },
    assetImageWrapper: {
      // top: -50,
      position: 'relative',
      zIndex: 1,
    },
    assetNameText: {
      textAlign: 'center',
      top: -30,
    },
  });
export default AssetDetailsHeader;
