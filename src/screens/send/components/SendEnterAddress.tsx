import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from 'react-native-paper';

import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { AppTheme } from 'src/theme';
import config from 'src/utils/config';

function SendEnterAddress({
  onDismiss,
  onProceed,
}: {
  onDismiss: any;
  onProceed: (text: string) => void;
}) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [address, setAddress] = useState('');
  const [inputHeight, setInputHeight] = React.useState(100);
  const styles = React.useMemo(
    () => getStyles(theme, inputHeight),
    [theme, inputHeight],
  );

  const handlePasteAddress = async () => {
    const clipboardValue = await Clipboard.getString();
    if (clipboardValue.startsWith('rgb:')) {
      Keyboard.dismiss();
      setAddress(clipboardValue);
      return;
    }
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let { type: paymentInfoKind, address } = WalletUtilities.addressDiff(
      clipboardValue,
      network,
    );
    if (paymentInfoKind) {
      Keyboard.dismiss();
      setAddress(address);
    } else {
      Keyboard.dismiss();
      onDismiss();
      if (clipboardValue.startsWith('rgb:')) {
        Toast(sendScreen.invalidRGBInvoiceAddress, true);
      } else {
        Toast(sendScreen.invalidBtcAddress, true);
      }
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
        onContentSizeChange={event => {
          setInputHeight(event.nativeEvent.contentSize.height);
        }}
        numberOfLines={3}
        inputStyle={styles.inputStyle}
        contentStyle={address ? styles.contentStyle : styles.contentStyle1}
        rightText={sendScreen.paste}
        onRightTextPress={() => handlePasteAddress()}
        rightCTAStyle={styles.rightCTAStyle}
        rightCTATextColor={theme.colors.accent1}
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
const getStyles = (theme: AppTheme, inputHeight) =>
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
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
    contentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
    },
  });
export default SendEnterAddress;
