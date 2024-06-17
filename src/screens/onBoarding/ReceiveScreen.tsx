import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';

function ReceiveScreen() {
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen } = translations;

  const [visible, setVisible] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader
        title="Receive"
        subTitle="Scan QR Lorem ipsum dolor sit amet,"
        enableBack={true}
      />
      <ReceiveQrDetails addMountModalVisible={() => setVisible(true)} />
      <FooterNote
        title="Note"
        subTitle="The blinded UTXO in this invoice will expire in 24 hours after its creation."
        customStyle={styles.advanceOptionStyle}
      />

      <ModalContainer
        conatinerModalStyle={styles.addAmountModalContainerStyle}
        title={receciveScreen.addAmountTitle}
        subTitle={receciveScreen.addAmountSubTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <AddAmountModal />
      </ModalContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  advanceOptionStyle: {
    backgroundColor: 'transparent',
  },
  addAmountModalContainerStyle: {
    width: '96%',
    alignSelf: 'center',
  },
});

export default ReceiveScreen;
