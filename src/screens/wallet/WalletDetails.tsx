import React from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { wp } from 'src/constants/responsive';
import WalletDetailsHeader from './components/WalletDetailsHeader';
import WalletTransactionsContainer from './components/WalletTransactionsContainer';

function WalletDetails({ navigation }) {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <WalletDetailsHeader
          profile={''}
          username="Dustin Henderson"
          balance="0.0134"
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
    padding: 0,
  },
  walletHeaderWrapper: {
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(20),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: '58%',
    marginHorizontal: wp(20),
  },
});
export default WalletDetails;
