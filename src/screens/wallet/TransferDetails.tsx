import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Transfer } from 'src/models/interfaces/RGBWallet';
import TransferDetailsContainer from './components/TransferDetailsContainer';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ModalContainer from 'src/components/ModalContainer';
import { Platform, StyleSheet, View } from 'react-native';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';
import CancelIllustration from 'src/assets/images/cancelIllustration.svg';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';

function TransferDetails({ route, navigation }) {
  const transaction: Transfer = route.params?.transaction;
  const coin = route.params?.coin;
  const assetId = route.params?.assetId;
  const precision = route.params?.precision;
  const { translations } = useContext(LocalizationContext);
  const { wallet, assets } = translations;
  const [visible, setVisible] = useState(false);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const {
    mutate: cancelTransactionMutation,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useMutation(() =>
    ApiHandler.handleTransferFailure(transaction.batchTransferIdx, false),
  );

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setVisible(true);
      }, 600);
    } else if (isError) {
      setVisible(false);
      Toast(`${error}` || 'An error occurred', true);
      navigation.goBack();
    } else {
      setVisible(false);
    }
  }, [isSuccess, isError, error, navigation]);

  return (
    <ScreenContainer>
      <AppHeader title={wallet.transferDetails} />
      <TransferDetailsContainer
        assetName={coin}
        transAmount={`${Number(transaction.amount) / 10 ** precision}`}
        assetId={assetId}
        transaction={transaction}
        onPress={() => cancelTransactionMutation()}
      />
      <ModalContainer
        title={assets.txnCancelSuccessMsg}
        subTitle={''}
        height={Platform.OS === 'ios' ? '45%' : ''}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => {}}>
        <View style={styles.modalBodyContainer}>
          <View style={styles.illustrationWrapper}>
            <CancelIllustration />
          </View>
          <PrimaryCTA
            title={assets.backToTransaction}
            onPress={() => {
              setVisible(false);
              navigation.goBack();
            }}
            width={'100%'}
            textColor={theme.colors.popupSentCTATitleColor}
            buttonColor={theme.colors.popupSentCTABackColor}
            height={hp(18)}
          />
        </View>
      </ModalContainer>
      <View>
        <ResponsePopupContainer
          visible={isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.cancelingTransferTitle}
            subTitle={assets.cancelingTransferSubTitle}
            illustrationPath={require('src/assets/images/jsons/cancelIllustration.json')}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalBodyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustrationWrapper: {
      marginVertical: hp(20),
    },
  });
export default TransferDetails;
