import { Animated, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Coin } from 'src/models/interfaces/RGBWallet';
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

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { assetId, askReview, askVerify } = useRoute().params;
  const {
    appType,
    setBackupProcess,
    setBackupDone,
    setManualAssetBackupStatus,
  } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const { mutate: backupMutate, isLoading: isBackupLoading } = useMutation(
    ApiHandler.backup,
    {
      onSuccess: () => {
        setBackupDone(true);
        setTimeout(() => {
          setBackupDone(false);
          setManualAssetBackupStatus(true);
        }, 1500);
      },
    },
  );
  const { mutate: checkBackupRequired, data: isBackupRequired } = useMutation(
    ApiHandler.isBackupRequired,
  );
  const refreshRgbWallet = useMutation({
    mutationFn: ApiHandler.refreshRgbWallet,
    onSuccess: () => {
      if (appType === AppType.ON_CHAIN) {
        checkBackupRequired();
      }
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (askReview) {
      setTimeout(async () => {
        await requestAppReview();
        if (askVerify) {
          setShowVerifyModal(true);
        }
      }, 2000);
    }
  }, [askReview, askVerify]);

  useEffect(() => {
    setBackupProcess(isBackupLoading);
  }, [isBackupLoading]);

  useEffect(() => {
    if (isBackupRequired) {
      backupMutate();
    }
  }, [isBackupRequired]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.Coin });
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
          checkBackupRequired();
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
        onDismiss={() => setShowVerifyModal(false)}
        schema={RealmSchema.Coin}
      />
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
