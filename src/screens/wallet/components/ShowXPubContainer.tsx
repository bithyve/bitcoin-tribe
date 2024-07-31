import React, { useContext } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';

// import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconCopy from 'src/assets/images/icon_copy.svg';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from 'src/screens/receive/components/ReceiveQrClipBoard';
import FooterNote from 'src/components/FooterNote';

function ShowXPubContainer({ xpub }) {
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ShowQRCode value={xpub} title={wallet.xPubDetails} />
        <ReceiveQrClipBoard qrCodeValue={xpub} icon={<IconCopy />} />
      </ScrollView>
      <FooterNote
        title={common.note}
        subTitle={wallet.xPubNoteSubTitle}
        customStyle={styles.advanceOptionStyle}
      />
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
