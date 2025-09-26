import { StyleSheet, useWindowDimensions, View } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { windowHeight } from 'src/constants/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import AssetsTabBar from './AssetsTabBar';
import Collectibles from 'src/screens/home/Collectibles';
import HomeHeader from 'src/screens/home/components/HomeHeader';
import CoinAssetsList from 'src/screens/home/components/CoinAssetsList';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { AssetVisibility, Coin } from 'src/models/interfaces/RGBWallet';
import { AssetType } from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from '../NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import useWallets from 'src/hooks/useWallets';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      margin: hp(16),
    },
  });

const routes = [
  { key: 'coins', title: 'Coins' },
  { key: 'collectibles', title: 'Collectibles' },
];

const AssetsTabs = () => {
  const layout = useWindowDimensions();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [index, setIndex] = React.useState(0);
  const navigation = useNavigation();
  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection
      .filtered(`visibility != $0`, AssetVisibility.HIDDEN)
      .filtered(`isDefault == $0`, false || null)
      .sorted('timestamp', true),
  );
  const [refreshing, setRefreshing] = useState(false);
  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];

  const refreshRgbWallet = useMutation({
    mutationFn: ApiHandler.refreshRgbWallet,
  });

  const handleRefresh = () => {
    setRefreshing(true);
    ApiHandler.fetchPresetAssets();
    refreshRgbWallet.mutate();
    refreshWallet.mutate({ wallets: [wallet] });
    setTimeout(() => setRefreshing(false), 2000);
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'coins':
        return (
          <CoinAssetsList
            listData={coins}
            loading={false}
            onRefresh={handleRefresh}
            refreshingStatus={refreshing}
            onPressAddNew={() => {
              navigation.navigate(NavigationRoutes.ADDASSET, {
                issueAssetType: AssetType.Coin,
              });
            }}
            onPressAsset={() =>
              navigation.navigate(NavigationRoutes.COINDETAILS)
            }
          />
        );
      case 'collectibles':
        return <Collectibles />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
        <HomeHeader showRegistry={true} showBalance={false} />
      </View>
      <TabView
        renderTabBar={props => <AssetsTabBar {...props} />}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  );
};

export default AssetsTabs;
