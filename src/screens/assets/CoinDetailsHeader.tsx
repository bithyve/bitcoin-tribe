import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery as realmUseQuery } from '@realm/react';
import { useNavigation } from '@react-navigation/native';

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
import {
  formatLargeNumber,
  numberWithCommas,
} from 'src/utils/numberWithCommas';
import TransactionButtons from 'src/screens/wallet/components/TransactionButtons';
import InfoScreenIcon from 'src/assets/images/infoScreenIcon.svg';
import InfoScreenIconLight from 'src/assets/images/infoScreenIcon_light.svg';
import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppTouchable from 'src/components/AppTouchable';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import AssetIcon from 'src/components/AssetIcon';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppContext } from 'src/contexts/AppContext';
import Toast from 'src/components/Toast';

type assetDetailsHeaderProps = {
  asset?: Coin | Collectible;
  onPressSetting?: () => void;
  onPressSend: () => void;
  onPressReceive: () => void;
  onPressBuy?: () => void;
  smallHeaderOpacity?: any;
  largeHeaderHeight?: any;
  headerRightIcon?: React.ReactNode;
  totalAssetLocalAmount?: number;
  disabled?: boolean;
};
function CoinDetailsHeader(props: assetDetailsHeaderProps) {
  const {
    asset,
    onPressSetting,
    onPressSend,
    onPressReceive,
    onPressBuy,
    smallHeaderOpacity,
    largeHeaderHeight,
    headerRightIcon,
    totalAssetLocalAmount,
    disabled = false,
  } = props;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isNodeInitInProgress } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { home, assets, node } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const combinedBalance =
    asset.balance.future + asset.balance?.offchainOutbound || 0;
  const lengthOfTotalBalance = combinedBalance.toString().length;
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const styles = getStyles(theme, insets, lengthOfTotalBalance, app.appType);

  const total =
    Number(asset.balance.future || 0) +
    Number(asset.balance?.offchainOutbound || 0) +
    Number(totalAssetLocalAmount || 0);

  const isVerified = asset?.issuer?.verifiedBy.some(
    item => item.verified === true,
  );

  return (
    <>
      {/* <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}>
        <AppHeader title={asset.ticker} rightIcon={headerRightIcon}/>
      </Animated.View> */}
      <View
        // style={[styles.largeHeader, { height: largeHeaderHeight }]}
        style={styles.largeHeader}>
        <AppHeader
        // rightIcon={isThemeDark ? <InfoScreenIcon /> : <InfoScreenIconLight />}
        // onSettingsPress={onPressSetting}
        />
        <View style={styles.largeHeaderContainer}>
          <View style={styles.largeHeaderContentWrapper}>
            <AppTouchable
              onPress={() => {
                if (isNodeInitInProgress) {
                  Toast(node.connectingNodeToastMsg, true);
                  return;
                }
                navigation.navigate(NavigationRoutes.COINMETADATA, {
                  assetId: asset.assetId,
                });
              }}>
              <View style={styles.identiconWrapper}>
                <View style={styles.identiconWrapper2}>
                  <AssetIcon
                    iconUrl={asset.iconUrl}
                    assetID={asset.assetId}
                    size={64}
                    verified={asset?.issuer?.verified}
                  />
                </View>
              </View>
              {app.appType === AppType.NODE_CONNECT ||
              app.appType === AppType.SUPPORTED_RLN ? (
                <View style={styles.lightningBalanceContainer}>
                  <AppTouchable
                    style={styles.lightningTotalBalanceWrapper}
                    onPress={() => {
                      if (isNodeInitInProgress) {
                        Toast(node.connectingNodeToastMsg, true);
                        return;
                      }
                      navigation.navigate(NavigationRoutes.COINMETADATA, {
                        assetId: asset.assetId,
                      });
                    }}>
                    <>
                      <View style={styles.btcBalanceWrapper}>
                        {isThemeDark ? <IconBTC /> : <IconBTCLight />}
                        <AppText variant="heading3" style={styles.balanceText}>
                          {numberWithCommas(
                            asset.balance.future +
                              asset.balance?.offchainOutbound,
                          )}
                        </AppText>
                      </View>
                      <View style={styles.lightningBalanceWrapper}>
                        <IconLightning />
                        <AppText variant="heading3" style={styles.balanceText}>
                          {numberWithCommas(totalAssetLocalAmount)}
                        </AppText>
                      </View>
                    </>
                  </AppTouchable>
                  <View style={styles.totalBalanceContainer}>
                    <View style={styles.lightningTotalBalanceContainer}>
                      <AppText
                        variant="caption"
                        style={styles.totalBalanceLabel}>
                        Total:&nbsp;
                      </AppText>
                      <AppText
                        variant="caption"
                        style={styles.totalBalanceLabel}>
                        {numberWithCommas(total)}
                      </AppText>
                    </View>
                    <View style={styles.lightningSpendableBalanceContainer}>
                      <AppText
                        variant="caption"
                        style={styles.totalBalanceLabel}>
                        Spendable:&nbsp;
                      </AppText>
                      <AppText
                        variant="caption"
                        style={styles.totalBalanceLabel}>
                        {formatLargeNumber(
                          Number(asset?.balance?.spendable) /
                            10 ** asset.precision,
                        )}
                      </AppText>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.balanceContainer}>
                  <AppTouchable
                    style={styles.onChainTotalBalanceWrapper}
                    onPress={() => {
                      if (isNodeInitInProgress) {
                        Toast(node.connectingNodeToastMsg, true);
                        return;
                      }
                      navigation.navigate(NavigationRoutes.COINMETADATA, {
                        assetId: asset.assetId,
                      });
                    }}>
                    <View style={styles.totalBalanceWrapper1}>
                      <AppText variant="heading2" style={styles.totalBalance}>
                        {formatLargeNumber(
                          Number(asset.balance.future) / 10 ** asset.precision +
                            Number(asset.balance?.offchainOutbound) /
                              10 ** asset.precision,
                        )}
                      </AppText>
                    </View>
                    <AppText variant="body2" style={styles.totalBalanceLabel}>
                      {home.totalBalance}
                    </AppText>
                  </AppTouchable>
                  <View style={styles.onChainTotalBalanceWrapper1}>
                    <View style={styles.totalBalanceWrapper1}>
                      <AppText variant="heading2" style={styles.totalBalance}>
                        {formatLargeNumber(
                          Number(asset?.balance?.spendable) /
                            10 ** asset.precision,
                        )}
                      </AppText>
                    </View>
                    <AppText variant="body2" style={styles.totalBalanceLabel}>
                      {assets.spendable}
                    </AppText>
                  </View>
                </View>
              )}
              <View style={styles.assetNameContainer}>
                <View style={styles.tickerWrapper}>
                  <AppText variant="body1" style={styles.assetTickerText}>
                    {asset.ticker}
                  </AppText>
                  {isVerified && <IconVerified width={20} height={20} />}
                </View>
                <View style={styles.assetNameWrapper}>
                  <AppText variant="body2" style={styles.assetNameText}>
                    {asset.name}
                  </AppText>
                </View>
              </View>
            </AppTouchable>
            <View style={styles.transCtaWrapper}>
              <TransactionButtons
                onPressSend={onPressSend}
                onPressReceive={onPressReceive}
                onPressBuy={onPressBuy}
                sendCtaWidth={wp(150)}
                receiveCtaWidth={wp(150)}
                disabled={disabled}
              />
            </View>
          </View>
        </View>
      </View>
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
      height: windowHeight > 810 ? '45%' : '47%',
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
      top: 30,
      marginVertical: hp(20),
      justifyContent: 'center',
    },
    lightningBalanceContainer: {
      width: '100%',
      top: 30,
      marginVertical: hp(20),
      justifyContent: 'center',
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
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    btcBalanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderColor,
      width: '50%',
      paddingRight: hp(20),
    },
    lightningBalanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: hp(20),
      width: '50%',
    },
    transCtaWrapper: {
      marginTop: hp(15),
      alignItems: 'center',
    },
    identiconWrapper: {
      alignSelf: 'center',
      position: 'absolute',
      top: -45,
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
      backgroundColor: theme.colors.inputBackground,
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
    lightningTotalBalanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    onChainTotalBalanceWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderColor,
      width: '52%',
    },
    onChainTotalBalanceWrapper1: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
      width: '48%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    assetNameContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: hp(20),
    },
    tickerWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    assetNameWrapper: {
      backgroundColor: theme.colors.transButtonBackColor,
      paddingHorizontal: hp(5),
      paddingVertical: hp(2),
      borderRadius: 5,
      marginLeft: hp(10),
    },
    lightningTotalBalanceContainer: {
      flexDirection: 'row',
      marginTop: hp(10),
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderColor,
      paddingRight: hp(5),
    },
    lightningSpendableBalanceContainer: {
      flexDirection: 'row',
      marginTop: hp(10),
      paddingLeft: hp(5),
    },
    totalBalanceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
export default CoinDetailsHeader;
