import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';
import WalletUtilities from 'src/services/wallets/operations/utils';

function ReceiveScreen({ route }) {
  const { receivingAddress, title, subTitle } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common } = translations;

  const [visible, setVisible] = useState(false);

  const [amount, setAmount] = useState(0);
  const [paymentURI, setPaymentURI] = useState(null);

  useEffect(() => {
    if (amount) {
      const newPaymentURI = WalletUtilities.generatePaymentURI(
        receivingAddress,
        {
          amount: parseInt(amount) / 1e8,
        },
      ).paymentURI;
      setPaymentURI(newPaymentURI);
    } else if (paymentURI) {
      setPaymentURI(null);
    }
  }, [amount, receivingAddress]);

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ReceiveQrDetails
          addMountModalVisible={() => setVisible(true)}
          receivingAddress={paymentURI || receivingAddress || 'address'}
        />
      </ScrollView>
      <FooterNote title={common.note} subTitle={receciveScreen.noteSubTitle} />

      <ModalContainer
        conatinerModalStyle={styles.addAmountModalContainerStyle}
        title={receciveScreen.addAmountTitle}
        subTitle={receciveScreen.addAmountSubTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <AddAmountModal callback={setAmount} />
      </ModalContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addAmountModalContainerStyle: {
    width: '96%',
    alignSelf: 'center',
  },
});

export default ReceiveScreen;
