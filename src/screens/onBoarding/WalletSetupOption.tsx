import * as React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import AppHeader from 'src/components/AppHeader';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function WalletSetupOption({ navigation }) {
  return (
    <ScreenContainer>
      <AppHeader title="Welcome," />
      <OptionCard
        icon={<IconWallet />}
        title="Create New"
        subTitle="Lorem ipsum dolor sit amet"
        onPress={() => navigation.navigate(NavigationRoutes.PROFILESETUP)}
      />
      <OptionCard
        icon={<IconWallet />}
        title="Recovery Phrase"
        subTitle="Lorem ipsum dolor si"
        navigation={navigation}
      />
      <OptionCard
        title="Advanced Options"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
        navigation={navigation}
      />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  advanceOptionStyle: {
    flex: 1,
    position: 'absolute',
    bottom: 10,
    margin: hp(20),
  },
});
export default WalletSetupOption;
