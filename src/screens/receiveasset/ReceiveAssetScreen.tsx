import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { useNavigation, useRoute } from '@react-navigation/native';
// import CreateUtxosModal from 'src/components/CreateUtxosModal';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { hp, wp } from 'src/constants/responsive';
import AppType from 'src/models/enums/AppType';
import { useTheme } from 'react-native-paper';

function ReceiveAssetScreen() {
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const assetId = route.params.assetId || '';
  const amount = route.params.amount || '';
  const selectedType = route.params.selectedType || 'bitcoin';
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error } = useMutation(ApiHandler.receiveAsset);
  const generateLNInvoiceMutation = useMutation(ApiHandler.receiveAssetOnLN);
  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
  } = useMutation(ApiHandler.createUtxos);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  // const [showErrorModal, setShowErrorModal] = useState(false);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [lightningInvoice, setLightningInvoice] = useState('');
  const [rgbInvoice, setRgbInvoice] = useState('');

  useEffect(() => {
    if (app.appType !== AppType.ON_CHAIN) {
      if (assetId === '') {
        mutate(assetId, amount);
      } else {
        generateLNInvoiceMutation.mutate({
          amount: Number(amount),
          assetId,
        });
      }
    } else {
      mutate(assetId, amount);
    }
  }, []);

  // useEffect(() => {
  //   if (error) {
  //     setTimeout(() => {
  //       createUtxos.mutate();
  //     }, 500);
  //   }
  // }, [error]);

  useEffect(() => {
    if (!error) return;
    const getErrorMessage = err =>
      err?.message || err?.toString() || 'An unknown error occurred';

    const errorMessage = getErrorMessage(error);
    // console.log('useEffect errorMessage', errorMessage);
    const handleSpecificError = message => {
      if (message === 'Insufficient sats for RGB') {
        setTimeout(() => {
          console.log('call utxo');
          createUtxos();
        }, 500);
        return true;
      }
      return false;
    };
    if (!handleSpecificError(errorMessage)) {
      Toast(errorMessage, true);
    }
  }, [error]);

  useEffect(() => {
    if (generateLNInvoiceMutation.error) {
      let errorMessage;
      // Check if the error is an instance of Error and extract the message
      if (generateLNInvoiceMutation.error instanceof Error) {
        errorMessage = generateLNInvoiceMutation.error.message;
      } else if (typeof generateLNInvoiceMutation.error === 'string') {
        errorMessage = generateLNInvoiceMutation.error;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      Toast(`${errorMessage}`, true);
      // Toast(generateLNInvoiceMutation.error, true);
    } else if (generateLNInvoiceMutation.data) {
      setLightningInvoice(generateLNInvoiceMutation?.data?.invoice);
    }
  }, [generateLNInvoiceMutation.data, generateLNInvoiceMutation.error]);

  useEffect(() => {
    if (createUtxoData) {
      setTimeout(() => {
        mutate();
      }, 400);
    } else if (createUtxoError) {
      createUtxoReset();
      fetchUTXOs();
      navigation.goBack();
      Toast(
        'An issue occurred while processing your request. Please try again.',
        true,
      );
      // Toast(`${createUtxoError}`, true);
    } else if (createUtxoData === false) {
      Toast(walletTranslation.failedToCreateUTXO, true);
      navigation.goBack();
    }
  }, [createUtxoData, createUtxoError]);

  useEffect(() => {
    if (selectedType === 'lightning') {
      if (lightningInvoice === '') {
        generateLNInvoiceMutation.mutate({
          amount: Number(amount),
          assetId,
        });
      }
    } else {
      if (rgbInvoice === '') {
        mutate(assetId, amount);
      }
    }
  }, [selectedType]);

  const qrValue = useMemo(() => {
    if (selectedType === 'bitcoin') {
      if (assetId && amount) {
        const invoice = rgbWallet?.receiveData?.invoice
          .replace('rgb:~', `${assetId}`)
          .replace('~', amount);
        setRgbInvoice(invoice);
        return invoice;
      }
      setRgbInvoice(rgbWallet?.receiveData?.invoice);
      return rgbWallet?.receiveData?.invoice;
    } else {
      return lightningInvoice;
    }
  }, [selectedType, rgbWallet?.receiveData?.invoice, lightningInvoice]);

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.receiveAssetTitle}
        subTitle={assets.receiveAssetSubTitle}
        enableBack={true}
      />

      {/* <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          setTimeout(() => {
            createUtxos.mutate();
          }, 400);
        }}
      /> */}

      {isLoading ||
      createUtxos.isLoading ||
      generateLNInvoiceMutation.isLoading ? (
        <ModalLoading
          visible={
            isLoading ||
            createUtxos.isLoading ||
            generateLNInvoiceMutation.isLoading
          }
        />
      ) : error ? (
        <View />
      ) : (
        <View>
          <View style={styles.detailsContainer}>
            <ShowQRCode
              value={qrValue || 'address'}
              title={
                selectedType === 'bitcoin'
                  ? receciveScreen.invoiceAddress
                  : receciveScreen.lightningAddress
              }
              qrTitleColor={
                selectedType === 'bitcoin'
                  ? theme.colors.btcCtaBackColor
                  : theme.colors.accent1
              }
            />
            <ReceiveQrClipBoard
              qrCodeValue={qrValue}
              icon={isThemeDark ? <IconCopy /> : <IconCopyLight />}
            />
          </View>
          <FooterNote
            title={common.note}
            subTitle={receciveScreen.noteSubTitle}
            customStyle={styles.advanceOptionStyle}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  advanceOptionStyle: {
    backgroundColor: 'transparent',
  },
  detailsContainer: {
    height: '74%',
    marginTop: hp(20),
  },
  addAmountModalContainerStyle: {
    width: '96%',
    alignSelf: 'center',
  },
  footerView: {
    height: '8%',
    marginHorizontal: wp(16),
    marginVertical: wp(10),
  },
});

export default ReceiveAssetScreen;
