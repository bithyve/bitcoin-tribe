import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from '../../components/OptionCard';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';

function SendScreen({ route }) {
  const { receiveData, title, subTitle } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const [visible, setVisible] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <QRScanner />
      <OptionCard
        title={sendScreen.optionCardTitle}
        subTitle={sendScreen.optionCardSubTitle}
        style={styles.advanceOptionStyle}
        onPress={() => {
          receiveData === 'send' && setVisible(true);
        }}
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
  qrCodeContainer: {
    height: wp(340),
    width: wp(340),
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: wp(35),
    borderRadius: wp(8),
    overflow: 'hidden',
  },
  camera: {
    height: wp(340),
    width: wp(340),
  },
});
export default SendScreen;
