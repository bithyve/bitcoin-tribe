import { Animated, Image, Platform, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';
import { hp } from 'src/constants/responsive';

const CollectibleDetailsScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { assetId } = useRoute().params;
  const styles = getStyles();
  const { appType } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.Collectible });
      if (appType === AppType.NODE_CONNECT) {
        listPaymentshMutation.mutate();
      }
    });
    return unsubscribe;
  }, [navigation, assetId]);

  const filteredPayments = (listPaymentshMutation.data?.payments || []).filter(
    payment => payment.asset_id === assetId,
  );

  const transactionsData =
    appType === AppType.NODE_CONNECT
      ? Object.values({
          ...filteredPayments,
          ...collectible?.transactions,
        }).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime() || 0;
          const dateB = new Date(b.createdAt).getTime() || 0;
          return dateA - dateB;
        })
      : collectible?.transactions;

  // const largeHeaderHeight = scrollY.interpolate({
  //   inputRange: [0, 300],
  //   outputRange: [350, 0],
  //   extrapolate: 'clamp',
  // });

  // const smallHeaderOpacity = scrollY.interpolate({
  //   inputRange: [100, 150],
  //   outputRange: [0, 1],
  //   extrapolate: 'clamp',
  // });

  return (
    <ScreenContainer>
      <AssetDetailsHeader
        asset={collectible}
        assetName={collectible.name}
        assetTicker={collectible.details}
        assetImage={collectible?.media?.filePath}
        // smallHeaderOpacity={smallHeaderOpacity}
        // largeHeaderHeight={largeHeaderHeight}
        headerRightIcon={
          <Image
            source={{
              uri: Platform.select({
                android: `file://${collectible?.media?.filePath}`,
                ios: collectible?.media?.filePath,
              }),
            }}
            style={styles.imageStyle}
          />
        }
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
          navigation.navigate(NavigationRoutes.RECEIVEASSET, {
            refresh: true,
          })
        }
      />

      <TransactionsList
        transactions={transactionsData}
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
const getStyles = () =>
  StyleSheet.create({
    imageStyle: {
      height: hp(40),
      width: hp(40),
      borderRadius: 10,
    },
  });
export default CollectibleDetailsScreen;
