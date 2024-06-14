import * as React from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import QRScanner from 'src/components/QRScanner';
import { BarCodeReadEvent } from 'react-native-camera';

function SendScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
      <QRScanner
        onBarCodeRead={(event: BarCodeReadEvent) => {
          console.log(event);
        }}
      />
      <OptionCard
        title="or Enter details manually"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
        onPress={() => {}}
      />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  advanceOptionStyle: {
    flex: 1,
    position: 'absolute',
    bottom: 10,
    margin: hp(20),
  },
  qrCodeContainer: {
    height: wp(340),
    width: wp(340),
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: wp(35),
    borderRadius: wp(8),
    overflow: 'hidden',
  },
  camera: {
    height: wp(340),
    width: wp(340),
  },
});
export default SendScreen;
