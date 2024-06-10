import * as React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import OptionCard from './components/OptionCard';
import IconWallet from '../../assets/images/icon_wallet1.svg';
import { hp } from '../../constants/responsive';

function WalletSetupOption() {
  return (
    <ScreenContainer>
      <OptionCard
        icon={<IconWallet />}
        title="Create New"
        subTitle="Lorem ipsum dolor sit amet"
      />
      <OptionCard
        icon={<IconWallet />}
        title="Recovery Phrase"
        subTitle="Lorem ipsum dolor si"
      />
      <OptionCard
        title="Advanced Options"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
      />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  advanceOptionStyle: {
    marginTop: hp(130),
  },
});
export default WalletSetupOption;
