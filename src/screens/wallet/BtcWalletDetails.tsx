import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery as realmUseQuery } from '@realm/react';
import { useMutation, UseMutationResult } from 'react-query';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import { RealmSchema } from 'src/storage/enum';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useWallets from 'src/hooks/useWallets';
import { RgbUnspent, RGBWallet } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import useRgbWallets from 'src/hooks/useRgbWallets';
import AppType from 'src/models/enums/AppType';
import { AppTheme } from 'src/theme';
import GradientView from 'src/components/GradientView';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import RequestTSatsModal from './components/RequestTSatsModal';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import openLink from 'src/utils/OpenLink';

function BtcWalletDetails({ navigation, route, activeTab }) {
  const theme: AppTheme = useTheme();
  const { autoRefresh = false } = route.params || {};
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(app.walletImage || null);
  const [walletName, setWalletName] = useState(app.appName || null);
  const [visible, setVisible] = useState(false);
  const [visibleRequestTSats, setVisibleRequestTSats] = useState(false);
  const [refreshWallet, setRefreshWallet] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const wallet: Wallet = useWallets({}).wallets[0];
  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );
  const { mutate: fetchUTXOs }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );
  const { mutate: fetchOnChainTransaction, data } = useMutation(
    ApiHandler.getNodeOnchainBtcTransactions,
  );

  useEffect(() => {
    fetchUTXOs();
    if (app.appType === AppType.NODE_CONNECT) {
      fetchOnChainTransaction();
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      Toast(walletTranslations.testSatsRecived);
      fetchUTXOs();
      setRefreshWallet(true);
      walletRefreshMutation.mutate({
        wallets: [wallet],
      });
    } else if (isError) {
      Toast(walletTranslations.failedTestSatsRecived, true);
    }
  }, [isSuccess, isError]);
  return (
    <View>
      <GradientView
        style={styles.walletHeaderWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <WalletDetailsHeader
          profile={profileImage}
          username={walletName}
          wallet={wallet}
          rgbWallet={rgbWallet}
          activeTab={activeTab}
          onPressBuy={() =>
            app.appType === AppType.NODE_CONNECT
              ? setVisibleRequestTSats(true)
              : config.NETWORK_TYPE === NetworkType.TESTNET ||
                config.NETWORK_TYPE === NetworkType.REGTEST
              ? mutate()
              : setVisible(true)
          }
        />
      </GradientView>
      <View
        style={
          app.appType !== AppType.NODE_CONNECT
            ? styles.walletTransWrapper
            : styles.onChainWalletTransWrapper
        }>
        <WalletTransactionsContainer
          navigation={navigation}
          activeTab={activeTab}
          transactions={
            app.appType === AppType.NODE_CONNECT
              ? data?.transactions
              : wallet?.specs.transactions
          }
          wallet={wallet}
          autoRefresh={autoRefresh || refreshWallet}
        />
      </View>
      <ModalContainer
        title={common.buy}
        subTitle={walletTranslations.buySubtitle}
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
          title={walletTranslations.requestTSatsTitle}
          subTitle={walletTranslations.requestTSatSubTitle}
          onLaterPress={() => setVisibleRequestTSats(false)}
          onPrimaryPress={() => openLink('https://t.me/BitcoinTribeSupport')}
        />
      </ResponsePopupContainer>
      <ModalLoading visible={isLoading} />
    </View>
  );
}
const styles = StyleSheet.create({
  walletHeaderWrapper: {
    height: '55%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(16),
    borderBottomLeftRadius: hp(40),
    borderBottomRightRadius: hp(40),
    top: -60,
    marginHorizontal: 0,
  },
  onChainWalletTransWrapper: {
    height: '46%',
    top: -40,
    marginHorizontal: wp(16),
  },
  walletTransWrapper: {
    height: '47%',
    top: -40,
    marginHorizontal: wp(16),
  },
});
export default BtcWalletDetails;
