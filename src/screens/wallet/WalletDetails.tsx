import React from 'react';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import IconSetting from 'src/assets/images/icon_settings.svg';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';
import { View, StyleSheet } from 'react-native';

function WalletDetails({ navigation }) {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <WalletDetailsHeader
          profile={
            'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          }
          username="Dustin Henderson"
          balance="0.0134"
        />
      </View>
      <View style={styles.walletTransWrapper}>
        <WalletTransactionsContainer />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
  },
  walletHeaderWrapper: {
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTransWrapper: {
    height: '64%',
  },
});
export default WalletDetails;
