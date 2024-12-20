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
import WalletFooter from '../wallet/components/WalletFooter';
import { wp } from 'src/constants/responsive';
import AppType from 'src/models/enums/AppType';

function ReceiveAssetScreen() {
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const route = useRoute();
  const assetId = route.params.assetId || '';
  const amount = route.params.amount || '';
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error } = useMutation(ApiHandler.receiveAsset);
  const generateLNInvoiceMutation = useMutation(ApiHandler.receiveAssetOnLN);
  const createUtxos = useMutation(ApiHandler.createUtxos);
  // const [showErrorModal, setShowErrorModal] = useState(false);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [activeTab, setActiveTab] = useState((app.appType !== AppType.ON_CHAIN && assetId !== '') ? 'lightning' : 'bitcoin');
  const [lightningInvoice, setLightningInvoice] = useState('');
  const [rgbInvoice, setRgbInvoice] = useState('')

  useEffect(() => {
    if(app.appType !== AppType.ON_CHAIN) {
      if(assetId === '') {
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

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        createUtxos.mutate();
      }, 500);
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
      setActiveTab('lightning');
    }
  }, [generateLNInvoiceMutation.data, generateLNInvoiceMutation.error]);

  useEffect(() => {
    if (createUtxos.data) {
      setTimeout(() => {
        mutate();
      }, 400);
    } else if (createUtxos.data === false) {
      Toast(walletTranslation.failedToCreateUTXO, true);
    }
  }, [createUtxos.data]);

  const onTabChange = (tab: string) => {
    if (tab === 'lightning') {
      if (lightningInvoice === '') {
        generateLNInvoiceMutation.mutate({
          amount: Number(amount),
          assetId,
        });
      } else {
        setActiveTab(tab);
      }
    } else {
      setActiveTab(tab);
      if(rgbInvoice === '') {
        mutate(assetId, amount);
      }
    }
  };

  const qrValue = useMemo(() => {
    if (activeTab === 'bitcoin') {
      setRgbInvoice(rgbWallet?.receiveData?.invoice)
      return rgbWallet?.receiveData?.invoice;
    } else {
      return lightningInvoice;
    }
  }, [activeTab, rgbWallet?.receiveData?.invoice, lightningInvoice]);

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
          {(app.appType !== AppType.ON_CHAIN && assetId !== '') && (
            <View style={styles.footerView}>
              <WalletFooter activeTab={activeTab} setActiveTab={onTabChange} />
            </View>
          )}
          <ShowQRCode
            value={qrValue || 'address'}
            title={receciveScreen.invoiceAddress}
          />
          <ReceiveQrClipBoard
            qrCodeValue={qrValue}
            icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />
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
