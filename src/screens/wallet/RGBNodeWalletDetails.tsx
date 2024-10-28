import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery as realmUseQuery } from '@realm/react';
import { useMutation, UseMutationResult } from 'react-query';

import { wp, windowHeight } from 'src/constants/responsive';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import { RealmSchema } from 'src/storage/enum';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import RGBNodeWalletHeader from './components/RGBNodeWalletHeader';
import AppType from 'src/models/enums/AppType';

function RGBNodeWalletDetails({ navigation, route, activeTab }) {
  const { autoRefresh = false } = route.params || {};
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(app.walletImage || null);
  const [walletName, setWalletName] = useState(app.appName || null);
  const [visible, setVisible] = useState(false);
  const [refreshWallet, setRefreshWallet] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const wallet: Wallet = useWallets({}).wallets[0];
  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );

  return (
    <View>
      <View style={styles.walletHeaderWrapper}>
        <RGBNodeWalletHeader
          profile={profileImage}
          username={walletName}
          wallet={null}
          activeTab={activeTab}
          onPressSetting={() => mutate()}
          onPressBuy={() => setVisible(true)}
        />
      </View>
      <View
        style={
          app.appType === AppType.NODE_CONNECT
            ? styles.walletTransWrapper
            : styles.onChainWalletTransWrapper
        }>
        <WalletTransactionsContainer
          navigation={navigation}
          transactions={[]}
          wallet={''}
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
      <ModalLoading visible={isLoading} />
    </View>
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
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(16),
    // borderBottomWidth: 0.2,
    // borderBottomColor: 'gray',
  },
  onChainWalletTransWrapper: {
    height: '55%',
    marginHorizontal: wp(16),
  },
  walletTransWrapper: {
    height: '48%',
    marginHorizontal: wp(16),
  },
});
export default RGBNodeWalletDetails;
