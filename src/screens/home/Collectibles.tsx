import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import CollectibleAssetsList from './components/CollectibleAssetsList';
import HomeHeader from './components/HomeHeader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  Asset,
  AssetFace,
  AssetType,
  AssetVisibility,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';

function Collectibles() {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];

  const navigation = useNavigation();
  const { key, setBackupProcess, setBackupDone, setManualAssetBackupStatus } =
    useContext(AppContext);

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

  const refreshRgbWallet = useMutation({
    mutationFn: ApiHandler.refreshRgbWallet,
    onSuccess: () => {
      if (app.appType === AppType.ON_CHAIN) {
        checkBackupRequired();
      }
    },
  });

  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];
  const collectibles = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const udas = useQuery<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );

  const [refreshing, setRefreshing] = useState(false);

  const assets: Asset[] = useMemo(() => {
    return [...collectibles, ...udas]
      .map(item => item as Asset)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [collectibles, udas]);

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

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
  };

  const handleRefresh = () => {
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
