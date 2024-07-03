import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { wp, windowHeight } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import { RealmSchema } from 'src/storage/enum';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from 'react-query';
import { useQuery as realmUseQuery } from '@realm/react';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import useWallets from 'src/hooks/useWallets';

function WalletDetails({ navigation }) {
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [visible, setVisible] = useState(false);
  const [refreshWallet, setRefreshWallet] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const wallet: Wallet = useWallets({}).wallets[0];

  const refreshWalletQuery = useQuery(
    'refresh_wallet',
    async () => {
      return await ApiHandler.refreshWallets({
        wallets: [wallet],
      });
    },
    {
      enabled: refreshWallet,
    },
  );

  if (refreshWalletQuery.status === 'error') {
    Toast('Failed to refresh wallet');
  }

  useEffect(() => {
    setRefreshWallet(true); // refreshing wallet as soon as the user lands on the page
  }, []);

  useEffect(() => {
    if (app && app.walletImage && app.appName) {
      const base64Image = app.walletImage;
      setProfileImage(base64Image);
      setWalletName(app.appName);
    }
  }, [app]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <WalletDetailsHeader
          profile={profileImage}
          username={walletName}
          wallet={wallet}
          onPressSetting={() =>
            navigation.navigate(NavigationRoutes.WALLETSETTINGS)
          }
          onPressBuy={() => setVisible(true)}
        />
      </View>
      <View style={styles.walletTransWrapper}>
        <WalletTransactionsContainer
          navigation={navigation}
          transactions={wallet.specs.transactions}
        />
      </View>
      <ModalContainer
        title={common.buy}
        subTitle={app.buySubtitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <BuyModal />
      </ModalContainer>
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
    height: windowHeight < 650 ? '42%' : '35%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(25),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: windowHeight < 650 ? '53%' : '65%',
    marginHorizontal: wp(25),
  },
});
export default WalletDetails;
