import { Keyboard, StyleSheet, View } from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';

const SendAssetScreen = () => {
  const { assetId } = useRoute().params;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const createUtxos = useMutation(ApiHandler.createUtxos);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isButtonDisabled = useMemo(() => {
    return !invoice || !amount;
  }, [invoice, amount]);

  const sendAsset = useCallback(async () => {
    Keyboard.dismiss();

    const utxo = invoice.match(/~\/~\/([^?]+)\?/)[1];
    const endpoint = invoice.match(/endpoints=([^&]+)/)[1];
    setLoading(true);
    const response = await ApiHandler.sendAsset({
      assetId,
      blindedUTXO: utxo,
      amount,
      consignmentEndpoints: endpoint,
    });
    console.log('response', response);
    setLoading(false);
    if (response?.txid) {
      Toast('Sent successfully');
      navigation.goBack();
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`);
    }
  }, [invoice, amount, navigation]);

  useEffect(() => {
    if (createUtxos.error) {
      Toast('Insufficient sats in the main Wallet, failed to create new UTXOs');
    } else if (createUtxos.isSuccess) {
      setShowErrorModal(false);
      sendAsset();
    }
  }, [createUtxos.error, createUtxos.isSuccess, createUtxos.data, sendAsset]);

  const handleAmtChangeText = text => {
    const positiveNumberRegex = /^\d*[1-9]\d*$/;
    if (positiveNumberRegex.test(text)) {
      setAmount(text);
    } else {
      setAmount('');
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={'Send Asset'} subTitle={''} />
      <ModalLoading visible={loading || createUtxos.isLoading} />
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          createUtxos.mutate();
        }}
      />
      <TextField
        value={invoice}
        onChangeText={text => setInvoice(text)}
        placeholder={'Invoice'}
        style={styles.input}
      />

      <TextField
        value={amount}
        onChangeText={handleAmtChangeText}
        placeholder={'Amount'}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={sendAsset}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(10),
    },
    buttonWrapper: {
      marginTop: hp(20),
    },
  });

export default SendAssetScreen;