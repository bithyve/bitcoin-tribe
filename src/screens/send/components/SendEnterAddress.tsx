import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import React, { useContext, useState } from 'react';
import { View, StyleSheet, Keyboard, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { RealmSchema } from 'src/storage/enum';

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
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const onProceed = (paymentInfo: string) => {
    if (paymentInfo.startsWith('lnbc')) {
      navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
        invoice: paymentInfo,
      });
      return;
    }
    paymentInfo = paymentInfo.trim();
    const network = WalletUtilities.getNetworkByType(
      app.networkType,
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
      Toast(sendScreen.invalidBtcAddress, true);
    }
  };

  return (
    <View style={styles.container}>
      <TextField
        value={address}
        onChangeText={text => setAddress(text)}
        placeholder={sendScreen.enterAddress}
        keyboardType={'default'}
        returnKeyType={'Enter'}
        autoFocus={true}
        multiline={true}
        numberOfLines={2}
        inputStyle={styles.inputStyle}
        contentStyle={styles.contentStyle}
        rightText={sendScreen.paste}
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
            setTimeout(() => {
              onProceed(address);
            }, 400);
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
    },
    inputStyle: {
      padding: 10,
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
    contentStyle: {
      marginTop: 0,
    },
  });
export default SendEnterAddress;
