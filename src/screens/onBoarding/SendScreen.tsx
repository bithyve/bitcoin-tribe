import * as React from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import QRScanner from 'src/components/QRScanner';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function SendScreen() {
  const { translations } = React.useContext(LocalizationContext);
  const { sendScreen } = translations;

  return (
    <ScreenContainer>
      <AppHeader
        title={sendScreen.headerTitle}
        subTitle={sendScreen.headerSubTitle}
        enableBack={true}
      />
      <QRScanner />
      <OptionCard
        title={sendScreen.optionCardTitle}
        subTitle={sendScreen.optionCardSubTitle}
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
