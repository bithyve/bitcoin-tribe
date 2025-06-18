import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import CoinAssetsList from './components/CoinAssetsList';
import HomeHeader from './components/HomeHeader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { AppContext } from 'src/contexts/AppContext';
import {
  AssetType,
  AssetVisibility,
  Coin,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import AppType from 'src/models/enums/AppType';

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const latestVersion = useQuery<VersionHistory>(
    RealmSchema.VersionHistory,
  ).slice(-1)[0];
  const versionNumber = latestVersion?.version.match(/\((\d+)\)/)?.[1] || 'N/A';
  const navigation = useNavigation();
  const {
    key,
    setBackupProcess,
    setBackupDone,
    setManualAssetBackupStatus,
    isBackupInProgress,
    isBackupDone,
  } = useContext(AppContext);
  const { mutate: backupMutate, isLoading } = useMutation(ApiHandler.backup, {
    onSuccess: () => {
      setBackupDone(true);
      setTimeout(() => {
        setBackupDone(false);
        setManualAssetBackupStatus(true);
      }, 1500);
    },
  });
  const { mutate: checkBackupRequired, data: isBackupRequired } = useMutation(
    ApiHandler.isBackupRequired,
  );
  const initNodeMutation = useMutation(ApiHandler.initNode);

  const refreshRgbWallet = useMutation({
    mutationFn: ApiHandler.refreshRgbWallet,
    onSuccess: () => {
      if (app?.appType === AppType.ON_CHAIN) {
        checkBackupRequired();
      }
    },
  });

  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const rgbWallet = useRgbWallets({}).wallets[0];
  const { setAppType } = useContext(AppContext);
  const [refreshing, setRefreshing] = useState(false);

  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];

  const coinsResult = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection
      .filtered(`visibility != $0`, AssetVisibility.HIDDEN)
      .sorted('timestamp', true),
  );

  const coins = useMemo(() => {
    if (!coinsResult) return [];
    const coinsArray = coinsResult.slice();
    const tribeCoinIndex = coinsArray.findIndex(c => c.name === 'Tribe tUSDt');
    if (tribeCoinIndex !== -1) {
      const [tribeCoin] = coinsArray.splice(tribeCoinIndex, 1);
      return [tribeCoin, ...coinsArray];
    }
    return coinsArray;
  }, [coinsResult]);

  useEffect(() => {
    ApiHandler.fetchPresetAssets();
    if (app.appType === AppType.SUPPORTED_RLN) {
      initNodeMutation.mutate(app?.id);
    }
  }, []);

  useEffect(() => {
    setBackupProcess(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isBackupRequired) {
      backupMutate();
    }
  }, [isBackupRequired]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (Number(versionNumber) < 138) {
      Alert.alert(
        'Unsupported Version',
        'This version of Tribe is no longer supported. Please setup a new wallet to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              ApiHandler.resetApp(key);
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: NavigationRoutes.LOGINSTACK }],
                }),
              );
            },
          },
        ],
        { cancelable: false },
      );
    }
    fetchUTXOs();
    setAppType(app?.appType);
    refreshWallet.mutate({ wallets: [wallet] });
    ApiHandler.checkVersion();
    ApiHandler.getFeeAndExchangeRates();
    ApiHandler.syncFcmToken();
  }, [app?.appType]);

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
  };

  const handleRefresh = () => {
    if (isBackupInProgress || isBackupDone) {
      return;
    }
    setRefreshing(true);
    refreshRgbWallet.mutate();
    checkBackupRequired();
    refreshWallet.mutate({ wallets: [wallet] });
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader />
      </View>
      <CoinAssetsList
        listData={coins}
        loading={refreshing && !isBackupInProgress && !isBackupDone}
        onRefresh={handleRefresh}
        refreshingStatus={refreshing && !isBackupInProgress && !isBackupDone}
        onPressAddNew={() =>
          handleNavigation(NavigationRoutes.ADDASSET, {
            issueAssetType: AssetType.Coin,
          })
        }
        onPressAsset={() => handleNavigation(NavigationRoutes.COINDETAILS)}
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

export default HomeScreen;
