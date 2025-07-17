import React, { useState, useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { Keys } from 'src/storage';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { hp, windowHeight, wp } from 'src/constants/responsive';
// import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import ReceiveQrClipBoard from './components/ReceiveQrClipBoard';
import { useMMKVBoolean } from 'react-native-mmkv';
import OptionCard from 'src/components/OptionCard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import BackupPhraseModal from 'src/components/BackupPhraseModal';

function ReceiveScreen({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { receciveScreen, common } = translations;
  const [visible, setVisible] = useState(false);
  const [visibleBackupPhrase, setVisibleBackupPhrase] = useState(false);
  const [backup] = useMMKVBoolean(Keys.WALLET_BACKUP);
  const [showBackupAlert, setShowBackupAlert] = useMMKVBoolean(
    Keys.SHOW_WALLET_BACKUP_ALERT,
  );
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [amount, setAmount] = useState(0);
  const [paymentURI, setPaymentURI] = useState(null);
  const wallet: Wallet = useWallets({}).wallets[0];
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet || {};
  // const generateLNInvoiceMutation = useMutation(ApiHandler.receiveAssetOnLN);

  const [address, setAddress] = useState('');
  const getNodeOnchainBtcAddress = useMutation(
    ApiHandler.getNodeOnchainBtcAddress,
  );

  useEffect(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      getNodeOnchainBtcAddress.mutate();
    } else {
      const { receivingAddress } =
        WalletOperations.getNextFreeExternalAddress(wallet);
      setAddress(receivingAddress);
    }
  }, []);

  useEffect(() => {
    if (getNodeOnchainBtcAddress.isError) {
      Toast(getNodeOnchainBtcAddress.error?.message, true);
      navigation.goBack();
    } else if (getNodeOnchainBtcAddress.data) {
      if (getNodeOnchainBtcAddress.data.address) {
        setAddress(getNodeOnchainBtcAddress.data.address);
      } else if (
        getNodeOnchainBtcAddress?.data?.message === 'Internal server error'
      ) {
        Toast(
          'Unable to fetch address due to a server error. Please try again later.',
          true,
        );
        navigation.goBack();
      }
    }
  }, [getNodeOnchainBtcAddress.isError, getNodeOnchainBtcAddress.data]);

  useEffect(() => {
    if (amount) {
      const newPaymentURI = WalletUtilities.generatePaymentURI(address, {
        amount: parseInt(amount) / 1e8,
      }).paymentURI;
      setPaymentURI(newPaymentURI);
    } else if (paymentURI) {
      setPaymentURI(null);
    }
  }, [amount, address]);

  useEffect(() => {
    if (!backup && showBackupAlert === undefined) {
      setVisibleBackupPhrase(true);
    }
  }, [backup]);

  const qrValue = useMemo(() => {
    return paymentURI || address || 'address';
  }, [address, paymentURI]);

  return (
    <ScreenContainer>
      <ModalLoading visible={getNodeOnchainBtcAddress.isLoading} />
      <AppHeader
        title={common.receive}
        subTitle={receciveScreen.headerSubTitle}
        enableBack={true}
        onBackNavigation={
          () =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.replace(NavigationRoutes.HOME) // Fallback if goBack is not possible
        }
      />
      {getNodeOnchainBtcAddress.isLoading ? (
        <View />
      ) : (
        <View style={styles.bodyWrapper}>
          <View style={styles.qrWrapper}>
            <ReceiveQrDetails
              receivingAddress={qrValue}
              qrTitle={receciveScreen.bitcoinAddress}
            />
          </View>
          <ReceiveQrClipBoard
            qrCodeValue={qrValue}
            icon={isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />
          <OptionCard
            title={receciveScreen.addAmountTitle}
            // subTitle={receciveScreen.addAmountSubTitle}
            onPress={() => setVisible(true)}
          />
        </View>
      )}

      {/* <FooterNote title={common.note} subTitle={receciveScreen.noteSubTitle} /> */}

      <ModalContainer
        conatinerModalStyle={styles.addAmountModalContainerStyle}
        title={receciveScreen.addAmountTitle}
        subTitle={receciveScreen.addAmountSubTitle}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => setVisible(false)}>
        <AddAmountModal
          callback={setAmount}
          secondaryOnPress={() => setVisible(false)}
          primaryOnPress={() => setVisible(false)}
        />
      </ModalContainer>
      <View>
        <BackupPhraseModal
          visible={visibleBackupPhrase}
          primaryCtaTitle={common.backup}
          primaryOnPress={() => {
            setVisibleBackupPhrase(false);
            setShowBackupAlert(false);
            navigation.navigate(NavigationRoutes.APPBACKUP, {
              viewOnly: false,
            });
          }}
          onDismiss={() => {
            setShowBackupAlert(false);
            setVisibleBackupPhrase(false);
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addAmountModalContainerStyle: {
    width: '96%',
    alignSelf: 'center',
  },
  bodyWrapper: {
    flex: 1,
  },
  qrWrapper: {
    paddingTop: hp(25),
    height: windowHeight < 670 ? '65%' : '73%',
    // justifyContent: 'center',
  },
  footerView: {
    height: '8%',
    marginHorizontal: wp(16),
    marginVertical: wp(20),
  },
});

export default ReceiveScreen;
