import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@realm/react';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { useMutation, UseMutationResult } from 'react-query';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import { windowHeight } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';

import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import RefreshControlView from 'src/components/RefreshControlView';
import WalletTransactions from './components/WalletTransactions';
import { AppTheme } from 'src/theme';
import { RgbUnspent, RGBWallet } from 'src/models/interfaces/RGBWallet';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useWallets from 'src/hooks/useWallets';
import EmptyStateView from 'src/components/EmptyStateView';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppTouchable from 'src/components/AppTouchable';
import ReservedSatsView from './components/ReservedSatsView';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import useRgbWallets from 'src/hooks/useRgbWallets';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import ModalLoading from 'src/components/ModalLoading';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import RequestTSatsModal from './components/RequestTSatsModal';
import openLink from 'src/utils/OpenLink';

function WalletDetails({ navigation, route }) {
  const { autoRefresh } = route.params || {};
  const isFocused = useIsFocused();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const scrollY = useRef(new Animated.Value(0)).current;

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletStrings, common, sendScreen, home } = translations;
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleRequestTSats, setVisibleRequestTSats] = useState(false);

  const largeHeaderHeight = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [300, 0],
    extrapolate: 'clamp',
  });

  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const wallet: Wallet = useWallets({}).wallets[0];
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate: fetchOnChainTransaction, data } = useMutation(
    ApiHandler.getNodeOnchainBtcTransactions,
  );
  const { mutate: fetchUTXOs }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );
  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);
  const pullDownToRefresh = () => {
    setRefreshing(true);
    walletRefreshMutation.mutate({
      wallets: [wallet],
    });
    setTimeout(() => setRefreshing(false), 2000);
  };

  useEffect(() => {
    if (autoRefresh && isFocused) {
      walletRefreshMutation.mutate({
        wallets: [wallet],
      });
    }
  }, [autoRefresh && isFocused]);

  useEffect(() => {
    if (walletRefreshMutation.status === 'success') {
      // Toast(walletStrings.walletRefreshMsg, true);
    } else if (walletRefreshMutation.status === 'error') {
      Toast(walletStrings.failRefreshWallet, true);
    }
  }, [walletRefreshMutation]);

  useEffect(() => {
    fetchUTXOs();
    if (app.appType === AppType.NODE_CONNECT) {
      fetchOnChainTransaction();
      listPaymentshMutation.mutate();
    }
  }, []);
  
  const transactionsData =
  app.appType === AppType.NODE_CONNECT
    ? Object.values({ ...listPaymentshMutation.data, ...data?.transactions }).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0; 
        const dateB = new Date(b.createdAt).getTime() || 0; 
        return dateA - dateB;
      })
    : wallet?.specs.transactions;

  return (
    <ScreenContainer>
      <WalletDetailsHeader
        wallet={wallet}
        rgbWallet={rgbWallet}
        username={app.appName}
        smallHeaderOpacity={smallHeaderOpacity}
        largeHeaderHeight={largeHeaderHeight}
        onPressSend={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.SENDBTCSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.btcHeaderSubTitle,
              wallet: wallet,
            }),
          )
        }
        onPressRecieve={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN),
          )
        }
        onPressBuy={() =>
          config.NETWORK_TYPE === NetworkType.MAINNET
            ? setVisible(true)
            : config.NETWORK_TYPE === NetworkType.TESTNET ||
              config.NETWORK_TYPE === NetworkType.REGTEST
            ? mutate()
            : setVisibleRequestTSats(true)
        }
      />
      <WalletTransactionsContainer
        navigation={navigation}
        refreshing={refreshing}
        transactions={transactionsData}
        wallet={wallet}
        pullDownToRefresh={() => pullDownToRefresh()}
        autoRefresh={walletRefreshMutation.isLoading}
        scrollY={scrollY}
      />
      <ModalContainer
        title={common.buy}
        subTitle={walletStrings.buySubtitle}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => setVisible(false)}>
        <BuyModal />
      </ModalContainer>
      <ResponsePopupContainer
        backColor={theme.colors.modalBackColor}
        borderColor={theme.colors.modalBackColor}
        visible={visibleRequestTSats}
        enableClose={true}
        onDismiss={() => setVisibleRequestTSats(false)}>
        <RequestTSatsModal
          title={walletStrings.requestTSatsTitle}
          subTitle={walletStrings.requestTSatSubTitle}
          onLaterPress={() => setVisibleRequestTSats(false)}
          onPrimaryPress={() => openLink('https://t.me/BitcoinTribeSupport')}
        />
      </ResponsePopupContainer>
      <ModalLoading visible={isLoading} />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });
export default WalletDetails;
