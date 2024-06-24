import React from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { wp, windowHeight } from 'src/constants/responsive';
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
    padding: 0,
  },
  walletHeaderWrapper: {
    height: windowHeight < 650 ? '40%' : '33%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(20),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: windowHeight < 650 ? '58%' : '67%',
    marginHorizontal: wp(20),
  },
});
export default WalletDetails;
