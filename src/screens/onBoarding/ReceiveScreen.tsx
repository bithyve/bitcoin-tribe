import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import { hp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ReceiveQrDetails from './components/ReceiveQrDetails';

function ReceiveScreen() {
  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  advanceOptionStyle: {
    flex: 1,
    marginHorizontal: hp(2),
    backgroundColor: 'none',
  },
});

export default ReceiveScreen;
