import React, { useContext, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Code } from 'react-native-vision-camera';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import { hp } from 'src/constants/responsive';
import OptionCard from 'src/components/OptionCard';

function SendBTCScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);
  const { title, subTitle, wallet } = route.params;
  const [isScanning, setIsScanning] = useState(true);

  const onCodeScanned = useCallback((codes: Code[]) => {
    setIsScanning(false);
    const value = codes[0]?.value;
    if (value == null) {
      setIsScanning(true);
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
        setIsScanning(true);
        navigation.replace(NavigationRoutes.SENDTO, { wallet, address });
        break;
      case PaymentInfoKind.PAYMENT_URI:
        setIsScanning(true);
        navigation.replace(NavigationRoutes.SENDTO, {
          wallet,
          address,
          paymentURIAmount: amount,
        });
        break;
      default:
        setIsScanning(true);
        Toast(sendScreen.invalidBtcAddress, true);
    }
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title={title} enableBack={true} />
      <View style={styles.scannerWrapper}>
        <QRScanner onCodeScanned={onCodeScanned} isScanning={isScanning} />
      </View>
      <OptionCard
        title={sendScreen.optionCardTitle}
        onPress={() => {
          navigation.replace(NavigationRoutes.SENDTO, { wallet, address: '' });
        }}
      />
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
