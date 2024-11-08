import React, { useState, useContext, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import { Code } from 'react-native-vision-camera';

function SendScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const { receiveData, title, subTitle, wallet } = route.params;

  const onCodeScanned = useCallback((codes: Code[]) => {
    const value = codes[0]?.value;
    if (value == null) {
      return;
    }
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let {
      type: paymentInfoKind,
      address,
      amount,
    } = WalletUtilities.addressDiff(value, network);
    if (amount) {
      amount = Math.trunc(amount * 1e8);
    } // convert from bitcoins to sats
    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        navigation.replace(NavigationRoutes.SENDTO, { wallet, address });
        break;
      case PaymentInfoKind.PAYMENT_URI:
        navigation.replace(NavigationRoutes.SENDTO, {
          wallet,
          address,
          paymentURIAmount: amount,
        });
        break;
      case PaymentInfoKind.RGB_INVOICE:
        navigation.replace(NavigationRoutes.SELECTASSETTOSEND, {
          wallet,
          rgbInvoice: address,
        });
        break;
      case PaymentInfoKind.RLN_INVOICE:
        navigation.replace(NavigationRoutes.LIGHTNINGSEND, { invoice: value });
        break;
      default:
        Toast(sendScreen.invalidBtcAddress, true);
    }
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <View style={styles.scannerWrapper}>
        {!visible && <QRScanner onCodeScanned={onCodeScanned} />}
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
        enableCloseIcon={false}
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
