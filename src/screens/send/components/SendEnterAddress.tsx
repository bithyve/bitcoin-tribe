import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { View, StyleSheet, Keyboard, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';

import { AppTheme } from 'src/theme';
import config from 'src/utils/config';

function SendEnterAddress({
  onDismiss,
  wallet,
}: {
  onDismiss: any;
  wallet: Wallet;
}) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [address, setAddress] = useState('');

  const onProceed = (paymentInfo: string) => {
    paymentInfo = paymentInfo.trim();
    const network = WalletUtilities.getNetworkByType(
      wallet && wallet.networkType,
    );

    let {
      type: paymentInfoKind,
      address,
      amount,
    } = WalletUtilities.addressDiff(paymentInfo, network);

    if (amount) {
      amount = Math.trunc(amount * 1e8);
    } // convert from bitcoins to sats

    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        navigation.navigate(NavigationRoutes.SENDTO, { wallet, address });
        break;
      case PaymentInfoKind.PAYMENT_URI:
        navigation.navigate(NavigationRoutes.SENDTO, {
          wallet,
          address,
          paymentURIAmount: amount,
        });
        break;
      case PaymentInfoKind.RGB_INVOICE:
        navigation.replace(NavigationRoutes.SENDASSET, {
          wallet,
          rgbInvoice: address,
        });
        break;
      default:
        Toast(sendScreen.invalidBtcAddress, false, true);
    }
  };
  const handlePasteAddress = async () => {
    const getClipboardValue = await Clipboard.getString();
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let { type: paymentInfoKind, address } = WalletUtilities.addressDiff(
      getClipboardValue,
      network,
    );
    if (paymentInfoKind) {
      Keyboard.dismiss();
      setAddress(address);
    } else {
      Keyboard.dismiss();
      onDismiss();
      Toast(sendScreen.invalidBtcAddress, false, true);
    }
  };

  return (
    <View style={styles.container}>
      <TextField
        value={address}
        onChangeText={text => setAddress(text)}
        placeholder={sendScreen.enterAddress}
        keyboardType={'default'}
        autoFocus={true}
        inputStyle={styles.inputStyle}
        rightText="Paste"
        onRightTextPress={() => handlePasteAddress()}
        rightCTAStyle={styles.rightCTAStyle}
        rightCTATextColor={theme.colors.primaryCTAText}
      />
      <View style={styles.primaryCTAContainer}>
        <Buttons
          primaryTitle={common.proceed}
          secondaryTitle={common.cancel}
          primaryOnPress={() => {
            Keyboard.dismiss();
            onDismiss();
            onProceed(address);
          }}
          secondaryOnPress={navigation.goBack}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    primaryCTAContainer: {
      marginTop: hp(65),
    },
    container: {
      width: '100%',
      marginTop: hp(45),
    },
    inputStyle: {
      width: '80%',
    },
    rightCTAStyle: {
      backgroundColor: theme.colors.ctaBackColor,
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginHorizontal: hp(5),
    },
  });
export default SendEnterAddress;
