import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import Toast from 'src/components/Toast';
import Colors from 'src/theme/Colors';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { useNavigation } from '@react-navigation/native';
import CreateUtxosModal from 'src/components/CreateUtxosModal';

function ReceiveAssetScreen({}) {
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common, assets } = translations;
  const navigation = useNavigation();
  const { mutate, isLoading, error } = useMutation(ApiHandler.receiveAsset);
  const createUtxos = useMutation(ApiHandler.createUtxos);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    }
  }, [error]);

  useEffect(() => {
    if (createUtxos.error) {
      Toast(assets.insufficientSats, false, true);
      navigation.goBack();
    } else if (createUtxos.isSuccess) {
      setTimeout(() => {
        mutate();
      }, 100);
    }
  }, [createUtxos.error, createUtxos.isSuccess, createUtxos.data, mutate]);

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.receiveAssetTitle}
        subTitle={assets.receiveAssetSubTitle}
        enableBack={true}
      />

      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          createUtxos.mutate();
        }}
      />

      {isLoading || createUtxos.isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ height: '70%' }}
          color={Colors.ChineseOrange}
        />
      ) : error ? (
        <View />
      ) : (
        <View>
          <ShowQRCode
            value={rgbWallet?.receiveData?.invoice}
            title={receciveScreen.invoiceAddress}
          />
          <ReceiveQrClipBoard
            qrCodeValue={rgbWallet?.receiveData?.invoice}
            icon={<IconCopy />}
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
});

export default ReceiveAssetScreen;
