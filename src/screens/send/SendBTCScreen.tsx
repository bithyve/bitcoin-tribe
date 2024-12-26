import React, { useState, useContext, useCallback } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from 'react-native-paper';
import { Code } from 'react-native-vision-camera';
import Clipboard from '@react-native-clipboard/clipboard';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import TextField from 'src/components/TextField';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';

function SendBTCScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const [address, setAddress] = useState('');
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
      default:
        Toast(sendScreen.invalidBtcAddress, true);
    }
  }, []);

  const handlePasteAddress = async () => {
    const getClipboardValue = await Clipboard.getString();
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let {
      type: paymentInfoKind,
      address,
      amount,
    } = WalletUtilities.addressDiff(getClipboardValue, network);
    if (amount) {
      amount = Math.trunc(amount * 1e8);
    } // convert from bitcoins to sats
    if (paymentInfoKind) {
      Keyboard.dismiss();
      setAddress(address);
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
        default:
          Toast(sendScreen.invalidBtcAddress, true);
      }
    } else {
      Keyboard.dismiss();
      Toast(sendScreen.invalidBtcAddress, true);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={title} enableBack={true} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.keyboardAwareContainer}
        contentContainerStyle={styles.keyboardAwareContent}
        enableOnAndroid={true}
        keyboardOpeningTime={0}>
        <View style={styles.scannerWrapper}>
          {!visible && <QRScanner onCodeScanned={onCodeScanned} />}
        </View>
        <View style={styles.inputWrapper}>
          <AppText variant="body2" style={styles.recipientAddressLabel}>
            {sendScreen.recipientAddress}
          </AppText>
          <TextField
            value={address}
            onChangeText={text => setAddress(text)}
            placeholder={sendScreen.enterAddress}
            keyboardType={'default'}
            returnKeyType={'Enter'}
            multiline={true}
            numberOfLines={2}
            inputStyle={styles.inputStyle}
            contentStyle={styles.contentStyle}
            rightText={sendScreen.paste}
            onRightTextPress={() => handlePasteAddress()}
            rightCTAStyle={styles.rightCTAStyle}
            rightCTATextColor={theme.colors.accent1}
          />
        </View>
      </KeyboardAwareScrollView>
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
    keyboardAwareContainer: {
      flex: 1,
    },
    keyboardAwareContent: {
      flexGrow: 1,
    },
    scannerWrapper: {
      flex: 1,
    },
    inputWrapper: {
      paddingVertical: 16,
    },
    recipientAddressLabel: {
      marginVertical: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    inputStyle: {
      width: '80%',
    },
    contentStyle: {
      marginTop: 0,
    },
    rightCTAStyle: {
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
  });
export default SendBTCScreen;
