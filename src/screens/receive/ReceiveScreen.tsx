import React, { useState, useContext } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';

function ReceiveScreen() {
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common } = translations;

  const [visible, setVisible] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader
        title={common.receive}
        subTitle={receciveScreen.headerSubTitle}
        enableBack={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ReceiveQrDetails addMountModalVisible={() => setVisible(true)} />
      </ScrollView>
      <FooterNote
        title={common.note}
        subTitle={receciveScreen.noteSubTitle}
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
