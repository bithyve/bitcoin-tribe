import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from '../onBoarding/components/OptionCard';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function SendScreen() {
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [visible, setVisible] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
      <OptionCard
        title="or Enter details manually"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
        onPress={() => setVisible(true)}
      />
      <ModalContainer
        title={sendScreen.enterSendAddress}
        subTitle={sendScreen.enterSendAdrsSubTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <SendEnterAddress />
      </ModalContainer>
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
export default SendScreen;
