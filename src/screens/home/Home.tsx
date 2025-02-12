import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
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

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();

  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);

  const rgbWallet = useRgbWallets({}).wallets[0];
  const { setAppType } = useContext(AppContext);

  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];

  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection
      .filtered(`visibility != $0`, AssetVisibility.HIDDEN)
      .sorted('timestamp', true),
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshRgbWallet.mutate();
    fetchUTXOs();
    setAppType(app.appType);
    refreshWallet.mutate({ wallets: [wallet] });
    ApiHandler.checkVersion();
    ApiHandler.getFeeAndExchangeRates();
  }, [app.appType]);

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
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
        <HomeHeader />
      </View>
      <CoinAssetsList
        listData={coins}
        loading={refreshing}
        onRefresh={handleRefresh}
        refreshingStatus={refreshing}
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
