import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'react-query';
import { useQuery } from '@realm/react';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  InvoiceMode,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import Toast from 'src/components/Toast';
import { Keys } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { hp, wp } from 'src/constants/responsive';
import AppType from 'src/models/enums/AppType';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ReceiveAssetScreen() {
  const { translations, formatString } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const theme: AppTheme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const assetId = route.params.assetId || '';
  const amount = route.params.amount || 0;
  const selectedType = route.params.selectedType || 'bitcoin';
  const invoiceExpiry = route.params.invoiceExpiry || 86400;
  const invoiceType = route.params.invoiceType || InvoiceMode.Blinded;
  const useWatchTower = route.params.useWatchTower || false;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error } = useMutation(ApiHandler.receiveAsset);
  const generateLNInvoiceMutation = useMutation(ApiHandler.receiveAssetOnLN);
  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
    isLoading: createUtxosLoading,
  } = useMutation(ApiHandler.createUtxos);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [lightningInvoice, setLightningInvoice] = useState('');
  const [rgbInvoice, setRgbInvoice] = useState('');
  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
  );
  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

  useEffect(() => {
    if (app.appType !== AppType.ON_CHAIN) {
      if (assetId === '') {
        if (invoiceType === InvoiceMode.Witness || colorable.length > 0) {
          mutate({
            assetId,
            amount,
            linkedAsset: '',
            linkedAmount: 0,
            expiry: invoiceExpiry,
            blinded: invoiceType === InvoiceMode.Blinded,
          });
        } else {
          createUtxos();
        }
      } else {
        generateLNInvoiceMutation.mutate({
          amount: Number(amount),
          assetId,
          expiry: invoiceExpiry,
        });
      }
    } else {
      if (invoiceType === InvoiceMode.Witness || colorable.length > 0) {
        mutate({
          assetId,
          amount,
          linkedAsset: assetId,
          linkedAmount: amount,
          expiry: invoiceExpiry,
          blinded: invoiceType === InvoiceMode.Blinded,
          useWatchTower
        });
      } else {
        createUtxos();
      }
    }
  }, []);

  useEffect(() => {
    if (error) {
      const getErrorMessage = err =>
        err?.message || err?.toString() || 'An unknown error occurred';
      const errorMessage = getErrorMessage(error);
      const handleSpecificError = message => {
        if (message === 'Insufficient sats for RGB') {
          createUtxos();
          return true;
        } else if (message === 'Asset not found') {
          setTimeout(() => {
            mutate({
              assetId: '',
              amount: 0,
              linkedAsset: assetId,
              linkedAmount: amount,
              expiry: invoiceExpiry,
              blinded: invoiceType === InvoiceMode.Blinded,
            });
          }, 100);
          return true;
        } else {
          Toast(errorMessage, true);
          navigation.goBack();
        }
        return false;
      };
      if (!handleSpecificError(errorMessage)) {
        Toast(errorMessage, true);
      }
    }
  }, [error]);

  useEffect(() => {
    if (generateLNInvoiceMutation.error) {
      let errorMessage;
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
      mutate({
        assetId,
        amount,
        linkedAsset: '',
        linkedAmount: 0,
        expiry: invoiceExpiry,
        blinded: invoiceType === InvoiceMode.Blinded,
        useWatchTower
      });
    } else if (createUtxoError) {
      createUtxoReset();
      fetchUTXOs();
      refreshRgbWallet.mutate();
      navigation.goBack();
      if( createUtxoError.toString().includes('Insufficient sats for RGB')){
        Toast(formatString(assets.insufficientSats, { amount: 2000 }), true);
      } else {
        Toast(assets.assetProcessErrorMsg, true);
      }
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
          expiry: invoiceExpiry,
        });
      }
    } else {
      if (rgbInvoice === '') {
        mutate({
          assetId,
          amount,
          linkedAsset: '',
          linkedAmount: 0,
          expiry: invoiceExpiry,
          blinded: invoiceType === InvoiceMode.Blinded,
        });
      }
    }
  }, [selectedType]);

  const loading = useMemo(() => {
    return (
      isLoading || createUtxosLoading || generateLNInvoiceMutation.isLoading
    );
  }, [isLoading, createUtxosLoading, generateLNInvoiceMutation.isLoading]);

  const qrValue = useMemo(() => {
    if (selectedType === 'bitcoin') {
      setRgbInvoice(rgbWallet?.receiveData?.invoice);
      return rgbWallet?.receiveData?.invoice;
    } else {
      return lightningInvoice;
    }
  }, [
    selectedType,
    rgbWallet?.receiveData?.invoice,
    lightningInvoice,
    loading,
  ]);

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.receiveAssetTitle}
        subTitle={assets.receiveAssetSubTitle}
        enableBack={true}
        onBackNavigation={() =>
          navigation.canGoBack? navigation.goBack() :
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: NavigationRoutes.HOME }],
            }),
          )
        }
      />

      <View>
        <ResponsePopupContainer
          visible={loading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.requestInvoiceProcessTitle}
            subTitle={assets.requestInvoiceProcessSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/recieveAssetIllustrationDark.json')
                : require('src/assets/images/jsons/recieveAssetIllustrationLight.json')
            }
          />
        </ResponsePopupContainer>
      </View>
      {!loading && !error && (
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
              message={assets.invoiceCopiedMsg}
            />
          </View>
        </View>
      )}
      <FooterNote
        title={common.note}
        subTitle={formatString(receciveScreen.noteSubTitle, {
          time: invoiceExpiry / 3600,
          type: invoiceType === InvoiceMode.Witness ? 'witness' : 'blinded',
        })}
        customStyle={styles.advanceOptionStyle}
      />
    </ScreenContainer>
  );
}

const getStyles = insets =>
  StyleSheet.create({
    advanceOptionStyle: {
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: insets.bottom,
      left: wp(20),
      right: wp(20),
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
