import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation, UseMutationResult } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AssetsList from './components/AssetsList';
import HomeHeader from './components/HomeHeader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  Asset,
  AssetFace,
  Coin,
  RgbUnspent,
} from 'src/models/interfaces/RGBWallet';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import { useMMKVString } from 'react-native-mmkv';
import AppText from 'src/components/AppText';

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen, home } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { version }: VersionHistory = useQuery(RealmSchema.VersionHistory)[0];
  const [image, setImage] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [currencyMode, setCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY);
  const initialCurrency = currency || 'USD';
  const initialCurrencyMode = currencyMode || CurrencyKind.SATS;
  const navigation = useNavigation();
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );

  const wallet: Wallet = useWallets({}).wallets[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Coin[]>(RealmSchema.Collectible);
  const assets: Asset[] = useMemo(() => {
    const combiled: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combiled.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  useEffect(() => {
    refreshRgbWallet.mutate();
    mutate();
    if (
      version !== `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`
    ) {
      ApiHandler.checkVersion(
        version,
        `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
      );
    }
    ApiHandler.getFeeAndExchangeRates();
    setCurrency(initialCurrency);
    setCurrencyMode(initialCurrencyMode);
  }, []);

  useEffect(() => {
    if ((app && app.walletImage) || app.appName) {
      const base64Image = app.walletImage;
      setImage(base64Image);
      setWalletName(app.appName);
    }
  }, [app]);

  const handleScreenNavigation = (screenPath: string, params?) => {
    navigation.dispatch(CommonActions.navigate(screenPath, params));
  };

  const toggleDisplayMode = () => {
    if (!currencyMode || currencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else if (currencyMode === CurrencyKind.BITCOIN) {
      setCurrencyMode(CurrencyKind.FIAT);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader
          profile={image}
          username={walletName}
          balance={`${
            wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed
          }`}
          onPressScanner={() =>
            handleScreenNavigation(NavigationRoutes.SENDSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.headerSubTitle,
              wallet: wallet,
            })
          }
          onPressNotification={() => console.log('notification')}
          onPressProfile={() =>
            handleScreenNavigation(NavigationRoutes.WALLETDETAILS, {
              autoRefresh: true,
            })
          }
          onPressTotalAmt={() => {
            toggleDisplayMode();
          }}
        />
      </View>
      <AppText variant="pageTitle2" style={styles.assetsTitleStyle}>
        {home.myAssets}
      </AppText>
      <AssetsList
        listData={assets}
        onPressAddNew={() => handleScreenNavigation(NavigationRoutes.ADDASSET)}
        onPressAsset={(asset: Asset) => {
          if (asset.assetIface === AssetFace.RGB20) {
            handleScreenNavigation(NavigationRoutes.COINDETAILS, {
              assetId: asset.assetId,
            });
          } else {
            handleScreenNavigation(NavigationRoutes.COLLECTIBLEDETAILS, {
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
      paddingTop: 0,
    },
    headerWrapper: {
      margin: hp(16),
    },
    assetsTitleStyle: {
      fontSize: 30,
      color: theme.colors.headingColor,
      marginHorizontal: hp(16),
      marginVertical: hp(15),
    },
  });
export default HomeScreen;
