import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import CollectibleAssetsList from './components/CollectibleAssetsList';
import { AppTheme } from 'src/theme';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  Asset,
  AssetSchema,
  AssetType,
  AssetVisibility,
  Coin,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';
import Toast from 'src/components/Toast';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';

function Collectibles() {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;

  const navigation = useNavigation();
  const {
    setBackupProcess,
    setBackupDone,
    setManualAssetBackupStatus,
    isBackupInProgress,
    isBackupDone,
    isNodeInitInProgress,
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
  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const [refreshing, setRefreshing] = useState(false);

  const assets: Asset[] = useMemo(() => {
    return [...coins, ...collectibles, ...udas]
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
      <CollectibleAssetsList
        listData={assets}
        loading={refreshing && !isBackupInProgress && !isBackupDone}
        onRefresh={handleRefresh}
        refreshingStatus={refreshing && !isBackupInProgress && !isBackupDone}
        onPressAddNew={() => {
          if (isNodeInitInProgress) {
            Toast(node.connectingNodeToastMsg, true);
            return;
          }
          handleNavigation(NavigationRoutes.ADDASSET, {
            issueAssetType: AssetType.Collectible,
          });
        }}
        onPressAsset={(asset: Asset) => {
          if (asset.assetSchema.toUpperCase() === AssetSchema.Coin) {
            handleNavigation(NavigationRoutes.COINDETAILS, {
              assetId: asset.assetId,
            });
          } else if (
            asset.assetSchema.toUpperCase() === AssetSchema.Collectible
          ) {
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
      paddingTop: -hp(40),
      backgroundColor: theme.colors.primaryBackground,
    },
  });

export default Collectibles;
