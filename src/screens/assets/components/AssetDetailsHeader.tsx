import React, { useContext } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery as realmUseQuery } from '@realm/react';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AssetFace, Coin, Collectible } from 'src/models/interfaces/RGBWallet';
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
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppTouchable from 'src/components/AppTouchable';
import useBalance from 'src/hooks/useBalance';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import AssetIcon from 'src/components/AssetIcon';

type assetDetailsHeaderProps = {
  assetName: string;
  asset?: Coin | Collectible;
  assetImage?: string;
  assetTicker?: string;
  onPressSetting?: () => void;
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
  smallHeaderOpacity?: any;
  largeHeaderHeight?: any;
  headerRightIcon?: React.ReactNode;
  totalAssetLocalAmount?: number;
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
    headerRightIcon,
    totalAssetLocalAmount,
  } = props;
  const insets = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { home, assets } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const combinedBalance =
    asset.balance.future + asset.balance?.offchainOutbound || 0;
  const lengthOfTotalBalance = combinedBalance.toString().length;
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const { getBalance, getCurrencyIcon } = useBalance();
  const styles = getStyles(theme, insets, lengthOfTotalBalance);

  return (
    <>
      {/* <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}>
        <AppHeader title={assetTicker} rightIcon={headerRightIcon}/>
      </Animated.View> */}
      <View
        // style={[styles.largeHeader, { height: largeHeaderHeight }]}
        style={styles.largeHeader}>
        <AppHeader
          rightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
          onSettingsPress={onPressSetting}
        />
        <View>
          <View style={styles.assetImageWrapper}>
            {asset.assetIface.toUpperCase() === AssetFace.RGB25 ? (
              <Image
                source={{
                  uri: Platform.select({
                    android: `file://${assetImage}`,
                    ios: assetImage,
                  }),
                }}
                resizeMode="cover"
                style={styles.imageStyle}
              />
            ) : (
              <View style={styles.identiconWrapper}>
                <View style={styles.identiconWrapper2}>
                  <AssetIcon
                    assetTicker={asset?.ticker}
                    assetID={asset?.assetId}
                    size={120}
                    verified={asset?.issuer?.verified}
                  />
                </View>
              </View>
            )}
          </View>
          <View style={styles.row}>
            <AppText variant="body2" style={styles.assetNameText}>
              {assetName}
            </AppText>
            {asset.issuer?.verified && <IconVerified width={24} height={24} />}
          </View>
        </View>
        <View style={styles.largeHeaderContainer}>
          <View style={styles.largeHeaderContentWrapper}>
            {app.appType === AppType.NODE_CONNECT ? (
              <View style={styles.balanceContainer}>
                <View style={styles.totalBalanceWrapper}>
                  <AppText variant="heading2" style={styles.totalBalance}>
                    {numberWithCommas(
                      asset.balance.future +
                        asset.balance?.offchainOutbound +
                        totalAssetLocalAmount,
                    )}
                  </AppText>
                  <AppText variant="body1" style={styles.totalBalanceLabel}>
                    {home.totalBalance}
                  </AppText>
                </View>
                <View style={styles.modeBalanceWrapper}>
                  <View style={styles.balanceWrapper}>
                    {isThemeDark ? <IconBTC /> : <IconBTCLight />}
                    <AppText variant="heading3" style={styles.balanceText}>
                      {numberWithCommas(
                        asset.balance.future + asset.balance?.offchainOutbound,
                      )}
                    </AppText>
                  </View>
                  <View style={styles.balanceWrapper}>
                    <IconLightning />
                    <AppText variant="heading3" style={styles.balanceText}>
                      {numberWithCommas(totalAssetLocalAmount)}
                    </AppText>
                  </View>
                </View>
              </View>
            ) : (
              <AppTouchable
                style={styles.onChainTotalBalanceWrapper}
                onPress={() => {}}>
                <View style={styles.totalBalanceWrapper1}>
                  <AppText variant="pageTitle2" style={styles.totalBalance}>
                    {numberWithCommas(
                      asset.balance.future + asset.balance?.offchainOutbound,
                    )}
                  </AppText>
                </View>
                <AppText variant="body1" style={styles.totalBalanceLabel}>
                  {home.totalBalance}
                </AppText>
              </AppTouchable>
            )}
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
      </View>
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
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      width: '100%',
      top: -30,
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
      top: -65,
      zIndex: 999,
      width: 120,
      height: 120,
      borderRadius: 120,
      backgroundColor: theme.colors.inputBackground,
    },
    identiconWrapper: {
      top: -65,
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
      height: 120,
      width: 120,
      borderRadius: 120,
    },
    assetImageWrapper: {
      // top: -50,
      position: 'relative',
      zIndex: 1,
    },
    assetNameText: {
      textAlign: 'center',
    },
    onChainTotalBalanceWrapper: {
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      top: -50,
      justifyContent: 'center',
    },
  });
export default AssetDetailsHeader;
