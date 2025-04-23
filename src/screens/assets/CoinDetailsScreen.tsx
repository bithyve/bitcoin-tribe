import { Animated, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Asset, Coin } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import TransactionsList from './TransactionsList';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import { Keys } from 'src/storage';
import CoinDetailsHeader from './CoinDetailsHeader';
import AssetSpendableAmtView from './components/AssetSpendableAmtView';
import { windowHeight } from 'src/constants/responsive';
import { requestAppReview } from 'src/services/appreview';
import VerifyIssuerModal from './components/VerifyIssuerModal';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const hasShownPostModal = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { assetId, askReview, askVerify, askAddToRegistry } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { common, settings, assets } = translations;

  const {
    appType,
    hasCompleteVerification,
    setCompleteVerification,
    hasIssuedAsset,
    setHasIssuedAsset,
  } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: getChannelMutate, data: channelsData } = useMutation(
    ApiHandler.getChannels,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [visibleAssetRegistry, setVisibleAssetRegistry] = useState(false);
  const [openTwitterAfterRegistryClose, setOpenTwitterAfterRegistryClose] =
    useState(false);
  const [openTwitterAfterVerifyClose, setOpenTwitterAfterVerifyClose] =
    useState(false);

  useEffect(() => {
    if (hasIssuedAsset) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
      }, 1000);
    }
  }, [hasIssuedAsset]);

  useEffect(() => {
    if (!visibleAssetRegistry && openTwitterAfterRegistryClose) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
        setOpenTwitterAfterRegistryClose(false);
      }, 1000);
    }
  }, [visibleAssetRegistry, openTwitterAfterRegistryClose]);

  useEffect(() => {
    if (!showVerifyModal && openTwitterAfterVerifyClose) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
        setOpenTwitterAfterVerifyClose(false);
      }, 1000);
    }
  }, [showVerifyModal, openTwitterAfterVerifyClose]);

  useEffect(() => {
    if (askReview) {
      setTimeout(async () => {
        await requestAppReview();
        if (askAddToRegistry) {
        } else if (askVerify) {
          setShowVerifyModal(true);
        }
      }, 2000);
    }
  }, [askReview, askVerify, askAddToRegistry]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        coin?.issuer?.verified &&
        hasCompleteVerification &&
        !hasShownPostModal.current
      ) {
        hasShownPostModal.current = true;
        setTimeout(() => {
          setVisiblePostOnTwitter(true);
        }, 1000);
      }
    }, [coin?.issuer?.verified, hasCompleteVerification]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.Coin });
      if (appType === AppType.NODE_CONNECT) {
        listPaymentshMutation.mutate();
        getChannelMutate();
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
          ...coin?.transactions,
        }).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime() || 0;
          const dateB = new Date(b.createdAt).getTime() || 0;
          return dateA - dateB;
        })
      : coin?.transactions;

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
      <CoinDetailsHeader
        asset={coin}
        // smallHeaderOpacity={smallHeaderOpacity}
        // largeHeaderHeight={largeHeaderHeight}
        headerRightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: coin.assetId,
            rgbInvoice: '',
            wallet: wallet,
          })
        }
        onPressSetting={() =>
          navigation.navigate(NavigationRoutes.COINMETADATA, { assetId })
        }
        onPressRecieve={() =>
          navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
            invoiceAssetId: coin.assetId,
          })
        }
        totalAssetLocalAmount={totalAssetLocalAmount}
      />
      <View style={styles.spendableBalanceWrapper}>
        <AssetSpendableAmtView
          spendableBalance={coin?.balance?.spendable}
          style={styles.toolTipCotainer}
        />
      </View>
      <TransactionsList
        style={styles.transactionContainer}
        transactions={transactionsData}
        isLoading={isLoading}
        refresh={() => {
          setRefreshing(true);
          refreshRgbWallet.mutate();
          mutate({ assetId, schema: RealmSchema.Coin });
          setTimeout(() => setRefreshing(false), 2000);
        }}
        refreshingStatus={refreshing}
        navigation={navigation}
        wallet={wallet}
        coin={coin.name}
        assetId={assetId}
        scrollY={scrollY}
      />

      <VerifyIssuerModal
        assetId={coin.assetId}
        isVisible={showVerifyModal}
        onDismiss={() => {
          setShowVerifyModal(false);
          setOpenTwitterAfterVerifyClose(true);
        }}
        schema={RealmSchema.Coin}
      />
      <>
        <PostOnTwitterModal
          visible={visiblePostOnTwitter}
          secondaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
          }}
          issuerInfo={coin}
        />
      </>
      <>
        <IssueAssetPostOnTwitterModal
          visible={visibleIssuedPostOnTwitter}
          secondaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setHasIssuedAsset(false);
          }}
          issuerInfo={coin}
        />
      </>
    </ScreenContainer>
  );
};

export default CoinDetailsScreen;

const styles = StyleSheet.create({
  spendableBalanceWrapper: {
    top: -30,
  },
  transactionContainer: {
    top: -25,
    height: windowHeight > 820 ? '52%' : '47%',
  },
  toolTipCotainer: {
    top: windowHeight > 670 ? 90 : 70,
  },
});
