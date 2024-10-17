import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery as realmUseQuery } from '@realm/react';
import { useMutation, UseMutationResult } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import { wp, windowHeight } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import { RealmSchema } from 'src/storage/enum';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useWallets from 'src/hooks/useWallets';
import { RgbUnspent } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import WalletFooter from './components/WalletFooter';

function WalletDetails({ navigation, route }) {
  const { autoRefresh = false } = route.params || {};
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(app.walletImage || null);
  const [walletName, setWalletName] = useState(app.appName || null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('bitcoin');
  const [refreshWallet, setRefreshWallet] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const wallet: Wallet = useWallets({}).wallets[0];
  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );
  const { mutate: fetchUTXOs }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );

  useEffect(() => {
    fetchUTXOs();
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
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <WalletDetailsHeader
          profile={profileImage}
          username={walletName}
          wallet={wallet}
          activeTab={activeTab}
          onPressSetting={() => mutate()}
          onPressBuy={() => setVisible(true)}
        />
      </View>
      <View style={styles.walletTransWrapper}>
        <WalletTransactionsContainer
          navigation={navigation}
          transactions={wallet.specs.transactions}
          wallet={wallet}
          autoRefresh={autoRefresh || refreshWallet}
        />
      </View>
      <View style={styles.footerView}>
        <WalletFooter
          activeTab={activeTab}
          setActiveTab={text => setActiveTab(text)}
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
      <ModalLoading visible={isLoading} />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  walletHeaderWrapper: {
    height: windowHeight < 670 ? '48%' : '45%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(16),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: windowHeight < 670 ? '40%' : '45%',
    marginHorizontal: wp(16),
  },
  footerView: {
    height: windowHeight < 670 ? '10%' : '15%',
    marginHorizontal: wp(16),
  },
});
export default WalletDetails;
