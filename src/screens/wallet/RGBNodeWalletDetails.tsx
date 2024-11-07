import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery as realmUseQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
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
import GradientView from 'src/components/GradientView';
import { AppTheme } from 'src/theme';
import { NetworkType } from 'src/services/wallets/enums';
import config from 'src/utils/config';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import RequestTSatsModal from './components/RequestTSatsModal';
import openLink from 'src/utils/OpenLink';

function RGBNodeWalletDetails({ navigation, route, activeTab }) {
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
  const wallet: Wallet = useWallets({}).wallets[0];
  const walletRefreshMutation = useMutation(ApiHandler.refreshWallets);
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );

  return (
    <View>
      <GradientView
        style={styles.walletHeaderWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <RGBNodeWalletHeader
          profile={profileImage}
          username={walletName}
          wallet={null}
          activeTab={activeTab}
          onPressBuy={() =>
            config.NETWORK_TYPE === NetworkType.MAINNET
              ? setVisible(true)
              : config.NETWORK_TYPE === NetworkType.TESTNET ||
                config.NETWORK_TYPE === NetworkType.REGTEST
              ? mutate()
              : setVisibleRequestTSats(true)
          }
        />
      </GradientView>
      <View
        style={
          app.appType === AppType.NODE_CONNECT
            ? styles.walletTransWrapper
            : styles.onChainWalletTransWrapper
        }>
        <WalletTransactionsContainer
          navigation={navigation}
          activeTab={activeTab}
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
    height: '46%',
    top: -40,
    marginHorizontal: wp(16),
  },
});
export default RGBNodeWalletDetails;
