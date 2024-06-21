import * as React from 'react';
import { StyleSheet } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ReceiveQrDetails from './components/ReceiveQrDetails';

function ReceiveScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Receive"
        subTitle="Scan QR Lorem ipsum dolor sit amet,"
        enableBack={true}
      />
      <ReceiveQrDetails />
      <FooterNote
        title="Note"
        subTitle="The blinded UTXO in this invoice will expire in 24 hours after its creation."
        customStyle={styles.advanceOptionStyle}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  advanceOptionStyle: {
    backgroundColor: 'transparent',
  },
});

export default ReceiveScreen;
