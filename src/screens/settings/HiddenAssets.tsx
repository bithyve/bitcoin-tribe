import React, { useContext, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import HiddenAssetsList from './components/HiddenAssetsList';
import { RealmSchema } from 'src/storage/enum';
import {
  Asset,
  AssetVisibility,
  Coin,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import useWallets from 'src/hooks/useWallets';
import { hp } from 'src/constants/responsive';

function HiddenAssets() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];
  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility == $0`, AssetVisibility.HIDDEN),
  );
  const collectibles = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection =>
      collection.filtered(`visibility == $0`, AssetVisibility.HIDDEN),
  );
  const udas = useQuery<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    collection =>
      collection.filtered(`visibility == $0`, AssetVisibility.HIDDEN),
  );
  const assets: Asset[] = useMemo(() => {
    return [...coins, ...collectibles, ...udas].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [coins, collectibles, udas]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshRgbWallet.mutate();
    refreshWallet.mutate({ wallets: [wallet] });
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.hiddenAssets}
        subTitle={settings.hiddenAssetSubTitle}
        style={styles.headerWrapper}
      />
      <HiddenAssetsList
        listData={assets}
        onRefresh={() => handleRefresh()}
        loading={refreshing}
        refreshingStatus={refreshing}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {},
    headerWrapper: {
      marginBottom: hp(10),
    },
  });
export default HiddenAssets;
