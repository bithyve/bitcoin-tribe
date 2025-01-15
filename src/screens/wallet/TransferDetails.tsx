import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/models/interfaces/RGBWallet';
import TransferDetailsContainer from './components/TransferDetailsContainer';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ModalContainer from 'src/components/ModalContainer';
import { Platform, StyleSheet, View } from 'react-native';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';
import CancelIllustration from 'src/assets/images/cancelIllustration.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function TransferDetails({ route, navigation }) {
  const transaction: Transaction = route.params?.transaction;
  const coin = route.params?.coin;
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
      setVisible(true);
    } else if (isError) {
      setVisible(false);
      Toast(`${error}`, true);
    } else {
      setVisible(false);
    }
  }, [isSuccess, isError]);

  return (
    <ScreenContainer>
      <AppHeader title={wallet.transferDetails} />
      <TransferDetailsContainer
        assetName={coin}
        transAmount={`${transaction.amount}`}
        transaction={transaction}
        onPress={() => cancelTransactionMutation()}
      />
      <ModalContainer
        title={assets.txnCancelSuccessMsg}
        subTitle={''}
        height={Platform.OS === 'android' ? '100%' : '45%'}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => {}}>
        <View style={styles.modalBodyContainer}>
          <View style={styles.illustrationWrapper}>
            <CancelIllustration />
          </View>
          <PrimaryCTA
            title={assets.backToHome}
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
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalBodyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustrationWrapper: {
      marginVertical: hp(20),
    },
  });
export default TransferDetails;
