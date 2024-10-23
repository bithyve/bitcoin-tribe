import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation, UseMutationResult } from 'react-query';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

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
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys, Storage } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import BackupAlert from './components/BackupAlert';
import AppType from 'src/models/enums/AppType';
import useRgbWallets from 'src/hooks/useRgbWallets';

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen, home } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { version }: VersionHistory = useQuery(RealmSchema.VersionHistory)[0];
  const [BackupAlertStatus] = useMMKVBoolean(Keys.BACKUPALERT);
  const intialBackupAlertStatus = BackupAlertStatus || false;
  const [currencyMode, setCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY);
  const initialCurrency = currency || 'USD';
  const initialCurrencyMode = currencyMode || CurrencyKind.SATS;
  const [image, setImage] = useState(null);
  const [visibleBackupAlert, setVisibleBackupAlert] = useState(
    intialBackupAlertStatus,
  );
  const [walletName, setWalletName] = useState(null);
  const navigation = useNavigation();
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: fetchUTXOs }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];

  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet: Wallet = useWallets({}).wallets[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Coin[]>(RealmSchema.Collectible);
  const assets: Asset[] = useMemo(() => {
    const combiled: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combiled.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const balances = useMemo(() => {
    if (app.appType === AppType.NODE_CONNECT) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    } else {
      return (
        wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed
      );
    }
  }, [rgbWallet?.nodeBtcBalance?.vanilla?.spendable]);

  useEffect(() => {
    refreshRgbWallet.mutate();
    fetchUTXOs();
    refreshWallet.mutate({
      wallets: [wallet],
    });
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
          balance={balances}
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
      <ResponsePopupContainer
        visible={visibleBackupAlert}
        enableClose={true}
        onDismiss={() => setVisibleBackupAlert(false)}
        backColor={theme.colors.primaryBackground}
        borderColor={theme.colors.borderColor}>
        <BackupAlert
          onPrimaryPress={() => {
            setVisibleBackupAlert(false);
            Storage.set(Keys.BACKUPALERT, false);
            setTimeout(() => {
              navigation.navigate(NavigationRoutes.APPBACKUPMENU);
            }, 400);
          }}
          onSkipPress={() => {
            setVisibleBackupAlert(false);
            Storage.set(Keys.BACKUPALERT, false);
          }}
        />
      </ResponsePopupContainer>
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
    assetsTitleStyle: {
      fontSize: 30,
      color: theme.colors.headingColor,
      marginHorizontal: hp(16),
      marginVertical: hp(15),
    },
  });
export default HomeScreen;
