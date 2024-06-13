import * as React from 'react';
import { StyleSheet, Linking } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import QRCodeScanner from 'react-native-qrcode-scanner';

function SendScreen() {
  
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
        <QRCodeScanner
          containerStyle={{ marginTop: wp(-20), borderRadius:wp(10)}}
          cameraStyle={{ height: 200, marginTop: wp(-20), borderRadius:wp(10), width: 280, alignSelf: 'center', justifyContent: 'center' }}
          onRead={(e)=>{
            console.log("QR code ",e)
            Linking.openURL(e.data).catch(err =>
              console.error('An error occured', err)
            );
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
  qrCodeContainer:{
    width: '90%',
    height: hp(340),
    marginTop: wp(80),
    marginHorizontal: wp(15),
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});
export default SendScreen;
