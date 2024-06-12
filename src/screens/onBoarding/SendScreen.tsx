import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';

// import QRCodeScanner from 'react-native-qrcode-scanner';÷

function SendScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
      <View style={styles.qrCodeContainer}>
        {/* This work is inprogress */}
        {/* <QRCodeScanner
          onRead={event => console.log('scan click', event)}
          cameraStyle={{ width: '100%', height: '15%', alignSelf: 'center' }}
        /> */}
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
  qrCodeContainer:{
    width: '90%',
    height: hp(340),
    marginTop: wp(80),
    marginHorizontal: wp(15),
  }
});
export default SendScreen;
