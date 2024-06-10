import * as React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import OptionCard from './components/OptionCard';
import IconWallet from '../../assets/images/icon_wallet1.svg';
import AppHeader from '../../components/AppHeader';
import { hp } from '../../constants/responsive';

function WalletSetupOption({ navigation }) {
  return (
    <ScreenContainer>
      <AppHeader title="Welcome," />
      <OptionCard
        icon={<IconWallet />}
        title="Create New"
        subTitle="Lorem ipsum dolor sit amet"
        onPress={() => navigation.navigate('ProfileSetup')}
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
