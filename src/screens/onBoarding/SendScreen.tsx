import * as React from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import QRScanner from 'src/components/QRScanner';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

interface SendScreenProps {
  navigation: any;
}

function SendScreen({navigation}: SendScreenProps) {
  return (
    <ScreenContainer>
      <AppHeader
        title="Send"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        enableBack={true}
      />
      <QRScanner/>
      <OptionCard
        title="or Enter details manually"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
        onPress={() => navigation.navigate(NavigationRoutes.RECEIVESCREEN)}
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
