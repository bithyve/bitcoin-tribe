import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { wp, windowHeight } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import realm from 'src/storage/realm/realm';
import { RealmSchema } from 'src/storage/enum';
import ModalContainer from 'src/components/ModalContainer';
import BuyModal from './components/BuyModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function WalletDetails({ navigation }) {
  const wallet = realm.get(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [visible, setVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  useEffect(() => {
    if (wallet && wallet.walletImage && wallet.appName) {
      const base64Image = wallet.walletImage;
      setProfileImage(base64Image);
      setWalletName(wallet.appName);
    }
  }, [wallet]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <WalletDetailsHeader
          profile={profileImage}
          username={walletName}
          balance="0.0134"
          onPressSetting={() =>
            navigation.navigate(NavigationRoutes.WALLETSETTINGS)
          }
          onPressBuy={() => setVisible(true)}
        />
      </View>
      <View style={styles.walletTransWrapper}>
        <WalletTransactionsContainer navigation={navigation} />
      </View>
      <ModalContainer
        title={common.buy}
        subTitle={wallet.buySubtitle}
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
