import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
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
import { hp, windowHeight } from 'src/constants/responsive';
import AssetSpendableAmtView from './components/AssetSpendableAmtView';
import { requestAppReview } from 'src/services/appreview';
import VerifyIssuerModal from './components/VerifyIssuerModal';
import {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

const CollectibleDetailsScreen = () => {
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const { assetId, askReview, askVerify } = useRoute().params;
  const styles = getStyles();
  const { appType } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: getChannelMutate, data: channelsData } = useMutation(
    ApiHandler.getChannels,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (askReview) {
      setTimeout(() => {
        requestAppReview();
      }, 2000);
    }
    if (askVerify) {
      setShowVerifyModal(true);
    }
  }, [askReview, askVerify]);

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

  const totalAssetLocalAmount = useMemo(() => {
    return (channelsData ?? [])
      .filter(channel => channel.asset_id === assetId)
      .reduce((sum, channel) => sum + (channel.asset_local_amount || 0), 0);
  }, [channelsData, assetId]);

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
  const transactionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 300],
        [windowHeight * 0.6, windowHeight * 0.9],
        'clamp',
      ),
    };
  });
  const largeHeaderHeight = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 300], [370, 0], 'clamp');
  });
  const smallHeaderOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [100, 150], [0, 1], 'clamp');
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
          navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
            invoiceAssetId: assetId,
          })
        }
        totalAssetLocalAmount={totalAssetLocalAmount}
      />
      <View style={styles.spendableBalanceWrapper}>
        <AssetSpendableAmtView
          spendableBalance={collectible?.balance?.spendable}
          style={styles.toolTipCotainer}
        />
      </View>
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
        style={[styles.transactionContainer, transactionsAnimatedStyle]}
      />
      <VerifyIssuerModal
        assetId={collectible.assetId}
        isVisible={showVerifyModal}
        onDismiss={() => setShowVerifyModal(false)}
        schema={RealmSchema.Collectible}
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
    spendableBalanceWrapper: {
      top: -30,
    },
    transactionContainer: {
      top: -25,
      height: windowHeight > 820 ? '52%' : '47%',
    },
    toolTipCotainer: {
      top: windowHeight > 670 ? 110 : 100,
    },
  });
export default CollectibleDetailsScreen;
