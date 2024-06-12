import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import IconSetting from 'src/assets/images/icon_settings.svg';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';

function WalletDetails({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <AppHeader rightIcon={<IconSetting />} navigation={navigation} />
        <WalletDetailsHeader
          profile={
            'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          }
          username="Dustin Henderson"
          balance="0.0134"
        />
      </View>
      <WalletTransactionsContainer />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    height: '32%',
    position: 'relative',
  },
});
export default WalletDetails;
