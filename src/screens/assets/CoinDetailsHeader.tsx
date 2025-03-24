import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery as realmUseQuery } from '@realm/react';
import Animated from 'react-native-reanimated';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { Coin, Collectible } from 'src/models/interfaces/RGBWallet';
import AppHeader from 'src/components/AppHeader';
import IconBTC from 'src/assets/images/icon_btc_new.svg';
import IconBTCLight from 'src/assets/images/icon_btc_new_light.svg';
import IconLightning from 'src/assets/images/icon_lightning_new.svg';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import TransactionButtons from 'src/screens/wallet/components/TransactionButtons';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import Identicon from 'src/components/Identicon';
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppTouchable from 'src/components/AppTouchable';
import IconVerified from 'src/assets/images/issuer_verified.svg';

type assetDetailsHeaderProps = {
  asset?: Coin | Collectible;
  onPressSetting?: () => void;
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
  smallHeaderOpacity?: any;
  largeHeaderHeight?: any;
  headerRightIcon?: React.ReactNode;
  totalAssetLocalAmount?: number;
};
function CoinDetailsHeader(props: assetDetailsHeaderProps) {
  const {
    asset,
    onPressSetting,
    onPressSend,
    onPressRecieve,
    onPressBuy,
    smallHeaderOpacity,
    largeHeaderHeight,
    headerRightIcon,
    totalAssetLocalAmount,
  } = props;
  const insets = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const combinedBalance =
    asset.balance.future + asset.balance?.offchainOutbound || 0;
  const lengthOfTotalBalance = combinedBalance.toString().length;
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const styles = getStyles(theme, insets, lengthOfTotalBalance, app.appType);
  return (
    <>
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}>
        <AppHeader title={asset.ticker} rightIcon={headerRightIcon} />
      </Animated.View>
      <Animated.View
        style={[
          styles.largeHeader,
          { height: largeHeaderHeight, overflow: 'hidden' },
        ]}>
        <AppHeader
          rightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
          onSettingsPress={onPressSetting}
        />
        <View style={styles.largeHeaderContainer}>
          <View style={styles.largeHeaderContentWrapper}>
            <View style={styles.balanceContainer}>
              <View style={styles.totalBalanceWrapper}>
                <View style={styles.identiconWrapper}>
                  <View style={styles.identiconWrapper2}>
                    <Identicon
                      value={asset.assetId}
                      style={styles.identiconView}
                      size={50}
                    />
                  </View>
                </View>
                <View>
                  <View style={styles.row}>
                    <AppText variant="body1" style={styles.assetTickerText}>
                      {asset.ticker}
                    </AppText>
                    {asset.issuer?.verified && (
                      <IconVerified width={24} height={24} />
                    )}
                  </View>
                  <View style={styles.row}>
                    <AppText variant="body2" style={styles.assetNameText}>
                      {asset.name}
                    </AppText>
                  </View>
                </View>
              </View>
              <View style={styles.totalBalanceWrapper2}>
                <AppTouchable
                  style={styles.onChainTotalBalanceWrapper}
                  onPress={() => {}}>
                  <View style={styles.totalBalanceWrapper1}>
                    <AppText variant="heading2" style={styles.totalBalance}>
                      {numberWithCommas(
                        asset.balance.future + asset.balance?.offchainOutbound,
                      )}
                    </AppText>
                  </View>
                  <AppText variant="body2" style={styles.totalBalanceLabel}>
                    {home.totalBalance}
                  </AppText>
                </AppTouchable>
                {app.appType === AppType.NODE_CONNECT && (
                  <>
                    <View style={styles.balanceWrapper}>
                      {isThemeDark ? <IconBTC /> : <IconBTCLight />}
                      <AppText variant="heading3" style={styles.balanceText}>
                        {numberWithCommas(
                          asset.balance.future +
                            asset.balance?.offchainOutbound,
                        )}
                      </AppText>
                    </View>
                    <View style={styles.balanceWrapper}>
                      <IconLightning />
                      <AppText variant="heading3" style={styles.balanceText}>
                        {numberWithCommas(totalAssetLocalAmount)}
                      </AppText>
                    </View>
                  </>
                )}
              </View>
            </View>
            <View style={styles.transCtaWrapper}>
              <TransactionButtons
                onPressSend={onPressSend}
                onPressRecieve={onPressRecieve}
                onPressBuy={onPressBuy}
                sendCtaWidth={wp(150)}
                receiveCtaWidth={wp(150)}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
const getStyles = (theme: AppTheme, insets, lengthOfTotalBalance, appType) =>
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
      height: windowHeight > 810 ? '47%' : '50%',
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      width: '100%',
      paddingVertical: appType === AppType.NODE_CONNECT ? hp(0) : hp(0),
    },
    largeHeaderContentWrapper: {
      paddingHorizontal: hp(10),
      paddingVertical: hp(15),
      width: '100%',
      borderRadius: hp(20),
      // overflow: 'visible',
      position: 'relative',
      backgroundColor: theme.colors.walletBackgroundColor,
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
      marginVertical: hp(10),
    },
    totalBalanceWrapper: {
      width: '50%',
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderColor,
      alignItems: 'center',
    },
    totalBalanceWrapper1: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    totalBalanceWrapper2: {
      width: '50%',
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
    transCtaWrapper: {
      marginTop: hp(15),
      alignItems: 'center',
    },
    identiconWrapper: {
      alignSelf: 'center',
      marginVertical: hp(10),
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
    },
    identiconView: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    assetTickerText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginRight: hp(2),
    },
    assetNameText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
    onChainTotalBalanceWrapper: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(5),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
export default CoinDetailsHeader;
