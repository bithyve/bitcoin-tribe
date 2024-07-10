import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';

import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconCopy from 'src/assets/images/icon_copy.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from 'src/screens/receive/components/ReceiveQrClipBoard';

function ShowXPubContainer({ xpub }) {
  const receivingAddress = 'address';
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common, wallet } = translations;

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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ShowQRCode value={xpub} title={wallet.xPubDetails} />
        <ReceiveQrClipBoard qrCodeValue={xpub} icon={<IconCopy />} />
      </ScrollView>
      {/* <FooterNote
        title={common.note}
        subTitle={wallet.xPubNoteSubTitle}
        customStyle={styles.advanceOptionStyle}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  advanceOptionStyle: {
    backgroundColor: 'transparent',
  },
});

export default ShowXPubContainer;
