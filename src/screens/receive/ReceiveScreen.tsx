import React, { useState, useContext, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';

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
import { wp } from 'src/constants/responsive';
// import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';

function ReceiveScreen({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common } = translations;
  const [visible, setVisible] = useState(false);
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
    if (app.appType === AppType.NODE_CONNECT) {
      getNodeOnchainBtcAddress.mutate();
    } else {
      const { changeAddress: receivingAddress } =
        WalletOperations.getNextFreeChangeAddress(wallet);
      setAddress(receivingAddress);
    }
  }, []);

  useEffect(() => {
    if (getNodeOnchainBtcAddress.isError) {
    } else if (getNodeOnchainBtcAddress.data) {
      if (getNodeOnchainBtcAddress.data.address) {
        setAddress(getNodeOnchainBtcAddress.data.address);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {getNodeOnchainBtcAddress.isLoading ? (
          <View />
        ) : (
          <View>
            <ReceiveQrDetails
              addMountModalVisible={() => setVisible(true)}
              receivingAddress={qrValue}
              qrTitle={receciveScreen.bitcoinAddress}
            />
          </View>
        )}
      </ScrollView>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addAmountModalContainerStyle: {
    width: '96%',
    alignSelf: 'center',
  },
  footerView: {
    height: '8%',
    marginHorizontal: wp(16),
    marginVertical: wp(20),
  },
});

export default ReceiveScreen;
