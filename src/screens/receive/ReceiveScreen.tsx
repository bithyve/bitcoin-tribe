import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AddAmountModal from './components/AddAmountModal';
import ReceiveQrDetails from './components/ReceiveQrDetails';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import RefreshControlView from 'src/components/RefreshControlView';

function ReceiveScreen({ route }) {
  const navigation = useNavigation();
  // const { receivingAddress } = route.params;
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

  return (
    <ScreenContainer>
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
          <RefreshControlView refreshing={true} onRefresh={() => {}} />
        ) : (
          <ReceiveQrDetails
            addMountModalVisible={() => setVisible(true)}
            receivingAddress={paymentURI || address || 'address'}
            qrTitle={receciveScreen.bitcoinAddress}
          />
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
});

export default ReceiveScreen;
