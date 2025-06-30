import {
  Animated,
  AppState,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
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
import { requestAppReview } from 'src/services/appreview';
import VerifyIssuerModal from './components/VerifyIssuerModal';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import {
  updateAssetIssuedPostStatus,
  updateAssetPostStatus,
} from 'src/utils/postStatusUtils';
import TransactionInfoCard from './components/TransactionInfoCard';
import Toast from 'src/components/Toast';

const CollectibleDetailsScreen = () => {
  const navigation = useNavigation();
  const hasShownPostModal = useRef(false);
  const appState = useRef(AppState.currentState);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { assetId, askReview, askVerify } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { common, settings, assets, node } = translations;
  const styles = getStyles();
  const {
    appType,
    hasCompleteVerification,
    setCompleteVerification,
    hasIssuedAsset,
    setHasIssuedAsset,
    isNodeInitInProgress,
  } = useContext(AppContext);
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
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [openTwitterAfterVerifyClose, setOpenTwitterAfterVerifyClose] =
    useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    if (hasIssuedAsset) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
      }, 1000);
    }
  }, [hasIssuedAsset]);

  useEffect(() => {
    if (!showVerifyModal && openTwitterAfterVerifyClose) {
      setTimeout(() => {
        setVisiblePostOnTwitter(true);
        setOpenTwitterAfterVerifyClose(false);
      }, 1000);
    }
  }, [showVerifyModal, openTwitterAfterVerifyClose]);

  useEffect(() => {
    if (askVerify) {
      setTimeout(() => setShowVerifyModal(true), 1000);
    }
  }, [askVerify]);

  useEffect(() => {
    if (askReview && refresh) {
      setTimeout(() => {
        requestAppReview();
      }, 2000);
    }
  }, [askReview, refresh]);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (askReview && refresh) {
          setTimeout(() => {
            requestAppReview();
          }, 2000);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [askReview, refresh]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        collectible?.issuer?.verified &&
        hasCompleteVerification &&
        !hasShownPostModal.current
      ) {
        hasShownPostModal.current = true;
        setTimeout(() => {
          setVisiblePostOnTwitter(true);
        }, 1000);
      }
    }, [collectible?.issuer?.verified, hasCompleteVerification]),
  );

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
  return (
    // <ScreenContainer style={styles.container}>
    <>
      <AssetDetailsHeader
        asset={collectible}
        assetName={collectible.name}
        assetTicker={collectible.details}
        assetImage={collectible?.media?.filePath}
        assetId={collectible.assetId}
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
        onPressSend={() => {
          if (isNodeInitInProgress) {
            Toast(node.connectingNodeToastMsg, true);
            return;
          }
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: assetId,
            rgbInvoice: '',
            wallet: wallet,
          });
        }}
        onPressSetting={() =>
          navigation.navigate(NavigationRoutes.TRANSACTIONTYPEINFO)
        }
        onPressReceive={() => {
          if (isNodeInitInProgress) {
            Toast(node.connectingNodeToastMsg, true);
            return;
          }
          navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
            invoiceAssetId: assetId,
            chosenAsset: collectible,
          });
        }}
        totalAssetLocalAmount={totalAssetLocalAmount}
      />
      {/* <View style={styles.spendableBalanceWrapper}>
        <TransactionInfoCard style={styles.toolTipCotainer} />
      </View> */}
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
        style={styles.transactionContainer}
      />
      <VerifyIssuerModal
        assetId={collectible.assetId}
        isVisible={showVerifyModal}
        onVerify={() => {
          setShowVerifyModal(false);
          setTimeout(() => setVisiblePostOnTwitter(true), 1000);
        }}
        onDismiss={() => {
          setShowVerifyModal(false);
          setTimeout(() => setVisibleIssuedPostOnTwitter(true), 1000);
        }}
        schema={RealmSchema.Collectible}
        onVerificationComplete={() => {
          setRefreshToggle(t => !t);
          setShowVerifyModal(false);
          setTimeout(() => setVisiblePostOnTwitter(true), 1000);
        }}
        primaryLoading={refreshToggle}
      />
      <>
        <PostOnTwitterModal
          visible={visiblePostOnTwitter}
          primaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(
              collectible,
              RealmSchema.Collectible,
              assetId,
              false,
            );
            updateAssetIssuedPostStatus(RealmSchema.Collectible, assetId, true);
            setRefresh(prev => !prev);
          }}
          secondaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(
              collectible,
              RealmSchema.Collectible,
              assetId,
              false,
            );
            updateAssetIssuedPostStatus(RealmSchema.Collectible, assetId, true);
          }}
          issuerInfo={collectible}
        />
      </>
      <>
        <IssueAssetPostOnTwitterModal
          visible={visibleIssuedPostOnTwitter}
          primaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setRefresh(prev => !prev);
            updateAssetIssuedPostStatus(
              RealmSchema.Collectible,
              assetId,
              false,
            );
          }}
          secondaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setHasIssuedAsset(false);
            setRefresh(prev => !prev);
            updateAssetIssuedPostStatus(
              RealmSchema.Collectible,
              assetId,
              false,
            );
          }}
          issuerInfo={collectible}
        />
      </>
    </>
  );
};
const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: hp(0),
    },
    imageStyle: {
      height: hp(40),
      width: hp(40),
      borderRadius: 10,
    },
    spendableBalanceWrapper: {
      paddingHorizontal: hp(14),
    },
    transactionContainer: {
      paddingHorizontal: hp(14),
      height: Platform.OS === 'ios' ? '46%' : '42%',
      marginTop: hp(15),
    },
    toolTipCotainer: {
      // top: windowHeight > 670 ? 110 : 100,
    },
  });
export default CollectibleDetailsScreen;
