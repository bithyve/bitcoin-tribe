import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import IconCopy from 'src/assets/images/icon_copy.svg';
import FooterNote from 'src/components/FooterNote';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from 'src/screens/receive/components/ReceiveQrClipBoard';

function ReceiveAssetContainer() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { home, common, receciveScreen } = translations;

  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentURI, setPaymentURI] = useState(null);
  const receivingAddress = 'address';

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ShowQRCode
          value={receivingAddress}
          title={receciveScreen.invoiceAddress}
        />
        <ReceiveQrClipBoard
          qrCodeValue={receivingAddress}
          icon={<IconCopy />}
        />
      </ScrollView>
      <FooterNote
        title={common.note}
        subTitle={home.receiveAssetNote}
        customStyle={styles.advanceOptionStyle}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    advanceOptionStyle: {
      // backgroundColor: 'transparent',
    },
  });
export default ReceiveAssetContainer;
