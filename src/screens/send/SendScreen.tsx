import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import SendAddressModal from './components/SendAddressModal';

function SendScreen({ route }) {
  const { receiveData, title, subTitle } = route.params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <QRScanner />
      <OptionCard
        title={sendScreen.optionCardTitle}
        subTitle={sendScreen.optionCardSubTitle}
        style={styles.advanceOptionStyle}
        onPress={() => {
          receiveData === 'send' && setVisible(true);
        }}
      />
      <SendAddressModal
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
