import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import IconScanner from 'src/assets/images/icon_scanner.svg';
import IconScannerLight from 'src/assets/images/icon_scanner_light.svg';
import IconRegistry from 'src/assets/images/ic_registry.svg';
import IconInfo from 'src/assets/images/ic_info.svg';
import IconInfoLight from 'src/assets/images/ic_info_light.svg';
import IconRegistryLight from 'src/assets/images/ic_registry_light.svg';
import IconWrapper from 'src/components/IconWrapper';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import HomeUserAvatar from './HomeUserAvatar';
import useBalance from 'src/hooks/useBalance';
import { Keys } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useWallets from 'src/hooks/useWallets';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
import useRgbWallets from 'src/hooks/useRgbWallets';
import PullDownRefreshInfoModal from './PullDownRefreshInfoModal';
import { AppContext } from 'src/contexts/AppContext';
import Toast from 'src/components/Toast';
import config from 'src/utils/config';
import AddContactIconLight from 'src/assets/images/addcontact_light.svg';
import AddContactIcon from 'src/assets/images/addcontact.svg';
import openLink from 'src/utils/OpenLink';

function HomeHeader({
  showBalance = true,
  showRegistry = false,
  showScanner = false,
  showSearch = false,
  showAdd = false,
}) {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { isNodeInitInProgress, setNodeInitStatus } = useContext(AppContext);
  const { translations } = React.useContext(LocalizationContext);
  const { home, common, sendScreen, node } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const wallet = useWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const rgbWallet = useRgbWallets({}).wallets[0];
  const [image, setImage] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [visiblePullDownRefreshInfo, setVisiblePullDownRefreshInfo] =
    useState(false);

  useEffect(() => {
    if (app?.walletImage || app?.appName) {
      setImage(app?.walletImage);
      setWalletName(app?.appName);
    }
  }, [app]);

  const balances = React.useMemo(() => {
    if (
      app?.appType === AppType.NODE_CONNECT ||
      app?.appType === AppType.SUPPORTED_RLN
    ) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    }
    return (
      wallet?.specs?.balances?.confirmed + wallet?.specs?.balances?.unconfirmed
    );
  }, [
    app?.appType,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
    wallet?.specs.balances,
  ]);

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
  };

  return (
    <View>
      <View style={styles.container}>
        <AppTouchable
          onPress={() => {
            if (isNodeInitInProgress) {
              Toast(node.connectingNodeToastMsg, true);
              return;
            }
            handleNavigation(NavigationRoutes.WALLETDETAILS, {
              autoRefresh: true,
            });
          }}
          style={styles.contentWrapper}>
          <View style={styles.contentWrapper}>
            <HomeUserAvatar imageSource={image} />
            <View style={styles.userDetailsWrapper}>
              <AppText
                numberOfLines={1}
                variant="heading3"
                style={styles.usernameText}>
                {walletName ? walletName : 'Satoshi’s Palette'}
              </AppText>
              {showBalance && (
                <View style={styles.balanceWrapper}>
                  {initialCurrencyMode !== CurrencyKind.SATS &&
                    getCurrencyIcon(
                      isThemeDark ? IconBitcoin : IconBitcoinLight,
                      isThemeDark ? 'dark' : 'light',
                      15,
                    )}
                  <AppText variant="body2" style={styles.balanceText}>
                    &nbsp;{getBalance(balances)}
                  </AppText>
                  {initialCurrencyMode === CurrencyKind.SATS && (
                    <AppText variant="caption" style={styles.satsText}>
                      sats
                    </AppText>
                  )}
                </View>
              )}
            </View>
          </View>
        </AppTouchable>
        <View style={styles.iconWrapper}>
          {showRegistry && (
            <IconWrapper
              onPress={() => {
                navigation.navigate(NavigationRoutes.WEBVIEWSCREEN, {
                  url: config.REGISTRY_URL.replace('asset', ''),
                  title: 'Registry',
                });
              }}>
              {isThemeDark ? <IconRegistry /> : <IconRegistryLight />}
            </IconWrapper>
          )}
          {showScanner && (
            <IconWrapper
              onPress={() => {
                if (isNodeInitInProgress) {
                  Toast(node.connectingNodeToastMsg, true);
                  return;
                }
                handleNavigation(NavigationRoutes.SENDSCREEN, {
                  receiveData: 'send',
                  title: common.send,
                  subTitle: sendScreen.headerSubTitle,
                });
              }}>
              {isThemeDark ? <IconScanner /> : <IconScannerLight />}
            </IconWrapper>
          )}
          {showSearch && (
            <IconWrapper onPress={() => openLink('https://bitcointribe.app/')}>
              {isThemeDark ? <IconInfo /> : <IconInfoLight />}
            </IconWrapper>
          )}
          {showAdd && (
            <IconWrapper
              onPress={() => {
                navigation.navigate(NavigationRoutes.PROFILEINFO);
              }}>
              {isThemeDark ? <AddContactIcon /> : <AddContactIconLight />}
            </IconWrapper>
          )}
        </View>
      </View>
      <View>
        <PullDownRefreshInfoModal
          visible={visiblePullDownRefreshInfo}
          primaryCtaTitle={common.okay}
          primaryOnPress={() => setVisiblePullDownRefreshInfo(false)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginTop: Platform.OS === 'android' ? hp(5) : 0,
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '68%',
      alignItems: 'center',
    },
    userDetailsWrapper: {
      marginLeft: wp(10),
    },
    usernameText: {
      color: theme.colors.headingColor,
      width: '100%',
      marginTop: hp(2),
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceText: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
      fontWeight: '300',
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
      fontWeight: '300',
    },
    iconWrapper: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      width: '32%',
      alignItems: 'flex-end',
    },
  });
export default HomeHeader;
