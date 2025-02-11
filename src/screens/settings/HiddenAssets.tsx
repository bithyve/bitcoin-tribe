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
  Coin,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';

function HiddenAssets() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered("visibility == 'HIDDEN'"),
  );
  const collectibles = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection => collection.filtered("visibility == 'HIDDEN'"),
  );
  const udas = useQuery<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    collection => collection.filtered("visibility == 'HIDDEN'"),
  );
  const assets: Asset[] = useMemo(() => {
    return [...coins, ...collectibles, ...udas].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [coins, collectibles, udas]);

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.hiddenAssets}
        subTitle={settings.hiddenAssetSubTitle}
      />
      <HiddenAssetsList
        listData={assets}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 2000);
        }}
        loading={refreshing}
        refreshingStatus={refreshing}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {},
  });
export default HiddenAssets;
