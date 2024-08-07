import React, { useState, useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';

function SendScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const { receiveData, title, subTitle, wallet } = route.params;

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <View style={styles.scannerWrapper}>
        <QRScanner />
      </View>
      <OptionCard
        title={sendScreen.optionCardTitle}
        subTitle={sendScreen.optionCardSubTitle}
        onPress={() => {
          receiveData === 'send'
            ? setVisible(true)
            : navigation.navigate(NavigationRoutes.CONNECTNODEMANUALLY);
        }}
      />
      <ModalContainer
        title={sendScreen.enterSendAddress}
        subTitle={sendScreen.enterSendAdrsSubTitle}
        visible={visible}
        height={Platform.OS == 'ios' && '85%'}
        onDismiss={() => setVisible(false)}>
        <SendEnterAddress onDismiss={() => setVisible(false)} wallet={wallet} />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
    },
  });
export default SendScreen;
