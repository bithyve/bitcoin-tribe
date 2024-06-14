import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import { RNCamera } from 'react-native-camera';

function SendScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
      <View style={styles.qrCodeContainer}>
        <RNCamera
          autoFocus="on"
          style={styles.cameraView}
          captureAudio={false}
          onBarCodeRead={data => {
            console.log('QR Code Data', data);
          }}
          useNativeZoom
        />
      </View>
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
    width: '90%',
    height: hp(340),
    marginTop: wp(80),
    marginHorizontal: wp(15),
  },
  cameraView: {
    alignSelf: 'center',
    height: wp(250),
    width: wp(250),
    borderRadius: wp(50),
  },
});
export default SendScreen;
