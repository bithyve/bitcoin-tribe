import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { AppTheme } from 'src/theme';
import config from 'src/utils/config';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import { Keys } from 'src/storage';

function SendEnterAddress({
  onDismiss,
  onProceed,
  errorMessage,
}: {
  onDismiss: any;
  onProceed: (text: string) => void;
  errorMessage?: string;
}) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [address, setAddress] = useState('');
  const [inputHeight, setInputHeight] = React.useState(100);
  const [invoiceValidationError, setInvoiceValidationError] = useState('');
  const styles = React.useMemo(
    () => getStyles(theme, inputHeight),
    [theme, inputHeight],
  );

  useEffect(() => {
    setInvoiceValidationError(errorMessage);
  }, [errorMessage]);

  const handlePastedText = (rawText: string) => {
    const text = rawText.replace(/\s/g, '') || null;
    const isRgbInvoice = text?.startsWith('rgb:');

    Keyboard.dismiss();

    if (isRgbInvoice) {
      setAddress(text);
      setInvoiceValidationError('');
      return;
    }
    if(text.startsWith('tribecontact://')) {
      Keyboard.dismiss();
      setAddress(text);
      setInvoiceValidationError('');
      return;
    }
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    const { type: paymentInfoKind, address } = WalletUtilities.addressDiff(
      text,
      network,
    );

    if (paymentInfoKind) {
      setAddress(address);
      setInvoiceValidationError('');
    } else {
      setInvoiceValidationError(
        isRgbInvoice
          ? sendScreen.invalidRGBInvoiceAddress
          : sendScreen.invalidBtcAddress,
      );
    }
  };

  const handleInvoiceInputChange = (text: string) => {
    if (!text?.trim()) {
      setAddress('');
      setInvoiceValidationError('');
      return;
    }
    handlePastedText(text);
  };

  const handlePasteAddress = async () => {
    const clipboardValue = await Clipboard.getString();
    handlePastedText(clipboardValue);
  };

  const handleClearAddress = () => {
    setAddress('');
    setInvoiceValidationError('');
  };

  return (
    <View style={styles.container}>
      <TextField
        value={address}
        onChangeText={handleInvoiceInputChange}
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
        rightText={!address && sendScreen.paste}
        rightIcon={address && isThemeDark ? <ClearIcon /> : <ClearIconLight />}
        onRightTextPress={() =>
          address ? handleClearAddress() : handlePasteAddress()
        }
        rightCTAStyle={styles.rightCTAStyle}
        rightCTATextColor={theme.colors.accent1}
        error={invoiceValidationError}
        onBlur={() => setInvoiceValidationError('')}
      />
      <View style={styles.primaryCTAContainer}>
        <Buttons
          primaryTitle={common.proceed}
          secondaryTitle={common.cancel}
          primaryOnPress={() => {
            Keyboard.dismiss();
            onProceed(address);
          }}
          secondaryOnPress={() => {
            setInvoiceValidationError(null);
            Keyboard.dismiss();
            onDismiss();
          }}
          width={windowWidth / 2.5}
          secondaryCTAWidth={windowWidth / 2.5}
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
