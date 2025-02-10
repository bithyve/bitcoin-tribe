import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import CollectibleAssetsList from './components/CollectibleAssetsList';
import HomeHeader from './components/HomeHeader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { AppContext } from 'src/contexts/AppContext';
import { Asset, AssetFace, AssetType } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import CurrencyKind from 'src/models/enums/CurrencyKind';

function Collectibles() {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen, home } = translations;

  const app = useQuery(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();

  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);

  const rgbWallet = useRgbWallets({}).wallets[0];
  const { setAppType } = useContext(AppContext);

  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];
  const collectibles = useQuery(RealmSchema.Collectible);
  const udas = useQuery(RealmSchema.UniqueDigitalAsset);

  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState(null);
  const [walletName, setWalletName] = useState(null);

  const assets: Asset[] = useMemo(() => {
    return [
      ...collectibles
        .filter(item => item.visible !== false)
        .map(item => item as Asset),
      ...udas.filter(item => item.visible !== false).map(item => item as Asset),
    ].sort((a, b) => b.timestamp - a.timestamp);
  }, [collectibles, udas]);

  const balances = useMemo(() => {
    if (app.appType === AppType.NODE_CONNECT) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    }
    return wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed;
  }, [
    app.appType,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
    wallet?.specs.balances,
  ]);

  useEffect(() => {
    refreshRgbWallet.mutate();
    fetchUTXOs();
    setAppType(app.appType);
    refreshWallet.mutate({ wallets: [wallet] });
    ApiHandler.getFeeAndExchangeRates();
  }, [app.appType]);

  useEffect(() => {
    if (app?.walletImage || app?.appName) {
      setImage(app.walletImage);
      setWalletName(app.appName);
    }
  }, [app]);

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
  };

  const toggleDisplayMode = () => {
    setAppType(
      app.currencyMode === CurrencyKind.SATS
        ? CurrencyKind.BITCOIN
        : app.currencyMode === CurrencyKind.BITCOIN
        ? CurrencyKind.FIAT
        : CurrencyKind.SATS,
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refreshRgbWallet.mutate();
    refreshWallet.mutate({ wallets: [wallet] });
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader
          profile={image}
          username={walletName}
          balance={balances}
          onPressScanner={() =>
            handleNavigation(NavigationRoutes.SENDSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.headerSubTitle,
              wallet,
            })
          }
          onPressNotification={() => console.log('Notification pressed')}
          onPressProfile={() =>
            handleNavigation(NavigationRoutes.WALLETDETAILS, {
              autoRefresh: true,
            })
          }
          onPressTotalAmt={toggleDisplayMode}
        />
      </View>
      <CollectibleAssetsList
        listData={assets}
        loading={refreshing}
        onRefresh={handleRefresh}
        refreshingStatus={refreshing}
        onPressAddNew={() =>
          handleNavigation(NavigationRoutes.ADDASSET, {
            issueAssetType: AssetType.Collectible,
          })
        }
        onPressAsset={(asset: Asset) => {
          if (asset.assetIface.toUpperCase() === AssetFace.RGB25) {
            handleNavigation(NavigationRoutes.COLLECTIBLEDETAILS, {
              assetId: asset.assetId,
            });
          } else {
            handleNavigation(NavigationRoutes.UDADETAILS, {
              assetId: asset.assetId,
            });
          }
        }}
      />
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: Platform.OS === 'android' ? hp(20) : 0,
    },
    headerWrapper: {
      margin: hp(16),
    },
  });

export default Collectibles;
