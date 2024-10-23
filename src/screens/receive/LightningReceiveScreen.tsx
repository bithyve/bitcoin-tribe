import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';

function LightningReceiveScreen({ route }) {
  const navigation = useNavigation();
  // const { receivingAddress } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common } = translations;

  const [visible, setVisible] = useState(false);

  const [amount, setAmount] = useState(0);
  const [paymentURI, setPaymentURI] = useState(null);
  const [receivingAddress, setReceivingAddress] = useState(null);

  return (
    <ScreenContainer>
      <AppHeader
        title={common.receive}
        subTitle={receciveScreen.headerSubTitle}
        enableBack={true}
        onBackNavigation={
          () =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.replace(NavigationRoutes.HOME) // Fallback if goBack is not possible
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ReceiveQrDetails
          addMountModalVisible={() => setVisible(true)}
          receivingAddress={paymentURI || receivingAddress || 'address'}
          qrTitle={receciveScreen.lightningAddress}
        />
      </ScrollView>
      {/* <FooterNote title={common.note} subTitle={receciveScreen.noteSubTitle} /> */}

      <ModalContainer
        conatinerModalStyle={styles.addAmountModalContainerStyle}
        title={receciveScreen.addAmountTitle}
        subTitle={receciveScreen.addAmountSubTitle}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => setVisible(false)}>
        <AddAmountModal
          callback={setAmount}
          secondaryOnPress={() => setVisible(false)}
          primaryOnPress={() => setVisible(false)}
        />
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

export default LightningReceiveScreen;
