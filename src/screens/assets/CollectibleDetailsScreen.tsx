import { Animated, StyleSheet } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';

import { Collectible } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import TransactionsList from './TransactionsList';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import AssetDetailsHeader from './components/AssetDetailsHeader';

const CollectibleDetailsScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { assetId } = useRoute().params;
  const styles = getStyles();
  const wallet: Wallet = useWallets({}).wallets[0];
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.Collectible });
    });
    return unsubscribe;
  }, [navigation, assetId]);

  const largeHeaderHeight = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [350, 0],
    extrapolate: 'clamp',
  });

  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <ScreenContainer>
      <AssetDetailsHeader
        asset={collectible}
        assetName={collectible.name}
        assetTicker={collectible.details}
        assetImage={collectible?.media?.filePath}
        smallHeaderOpacity={smallHeaderOpacity}
        largeHeaderHeight={largeHeaderHeight}
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: assetId,
            item: collectible,
            rgbInvoice: '',
            wallet: wallet,
          })
        }
        onPressSetting={() =>
          navigation.navigate(NavigationRoutes.COLLECTIBLEMETADATA, {
            assetId,
          })
        }
        onPressRecieve={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN),
          )
        }
      />

      <TransactionsList
        transactions={collectible?.transactions}
        isLoading={isLoading}
        refresh={() => {
          setRefreshing(true);
          refreshRgbWallet.mutate();
          mutate({ assetId, schema: RealmSchema.Collectible });
          setTimeout(() => setRefreshing(false), 2000);
        }}
        refreshingStatus={refreshing}
        navigation={navigation}
        wallet={wallet}
        coin={collectible.name}
        assetId={assetId}
        scrollY={scrollY}
      />
    </ScreenContainer>
  );
};
const getStyles = () => StyleSheet.create({});
export default CollectibleDetailsScreen;
