import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { wp, windowHeight } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import realm from 'src/storage/realm/realm';
import { RealmSchema } from 'src/storage/enum';

function WalletDetails({ navigation }) {
  const wallet = realm.get(RealmSchema.TribeApp)[0];
  const [profileImage, setProfileImage] = useState(null);
  const [walletName, setWalletName] = useState(null);

  useEffect(() => {
    if (wallet && wallet.walletImage && wallet.appName) {
      const base64Image = wallet.walletImage;
      setProfileImage(base64Image);
      setWalletName(wallet.appName);
    }
  }, []);

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
        />
      </View>
      <View style={styles.walletTransWrapper}>
        <WalletTransactionsContainer navigation={navigation} />
      </View>
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
    height: windowHeight < 650 ? '40%' : '33%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(25),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: windowHeight < 650 ? '58%' : '67%',
    marginHorizontal: wp(25),
  },
});
export default WalletDetails;
