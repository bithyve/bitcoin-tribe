import React, { useContext } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from 'src/screens/receive/components/ReceiveQrClipBoard';
import FooterNote from 'src/components/FooterNote';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp } from 'src/constants/responsive';

function ShowXPubContainer({ xpub }) {
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ShowQRCode value={xpub} title={wallet.xPubDetails} />
        <ReceiveQrClipBoard qrCodeValue={xpub} />
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
    marginTop: hp(20),
  },
  advanceOptionStyle: {
    backgroundColor: 'transparent',
  },
});

export default ShowXPubContainer;
