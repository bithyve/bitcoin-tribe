import { Animated, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

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
import { AppTheme } from 'src/theme';

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const scrollY = useSharedValue(0);
  const { assetId, askReview, askVerify } = useRoute().params;
  const { appType } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];

  const largeHeaderHeight = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 300], [350, 0], 'clamp');
  });
  const smallHeaderOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [100, 150], [0, 1], 'clamp');
  });

  const styles = getStyles(theme);
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

  const transactionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      flexGrow: 1,
      flex: 1,
      height: interpolate(
        scrollY.value,
        [0, 250],
        [windowHeight * 0.7, windowHeight * 0.95],
        'clamp',
      ),
    };
  });

  return (
    <ScreenContainer>
      <CoinDetailsHeader
        asset={coin}
        smallHeaderOpacity={smallHeaderOpacity}
        largeHeaderHeight={largeHeaderHeight}
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
        style={[styles.transactionContainer, transactionsAnimatedStyle]}
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
        onDismiss={() => setShowVerifyModal(false)}
        schema={RealmSchema.Coin}
      />
    </ScreenContainer>
  );
};

export default CoinDetailsScreen;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    spendableBalanceWrapper: {
      top: -30,
      backgroundColor: theme.colors.primaryBackground,
    },
    transactionContainer: {
      top: -25,
      minHeight: windowHeight * 0.6,
    },
    toolTipCotainer: {
      top: windowHeight > 670 ? 90 : 70,
    },
  });
