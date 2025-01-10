import React, { useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Transaction } from 'src/services/wallets/interfaces';
import TransferDetailsContainer from './components/TransferDetailsContainer';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { useMutation } from 'react-query';
import ModalLoading from 'src/components/ModalLoading';

function TransferDetails({ route, navigation }) {
  const transaction: Transaction = route.params?.transaction;
  const coin = route.params?.coin;
  const { translations } = useContext(LocalizationContext);
  const { wallet, assets } = translations;
  const theme: AppTheme = useTheme();
  const {
    mutate: cancelTransactionMutation,
    isLoading,
    isSuccess,
    isError,
  } = useMutation(() =>
    ApiHandler.handleTransferFailure(transaction.batchTransferIdx, false),
  );

  useEffect(() => {
    if (isSuccess) {
      Toast(assets.cancelTransferMsg);
      navigation.goBack();
    } else if (isError) {
    } else {
    }
  }, [isSuccess, isError]);

  return (
    <ScreenContainer>
      <AppHeader title={wallet.transferDetails} subTitle={coin} />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <TransferDetailsContainer
          transAmount={`${transaction.amount}`}
          transaction={transaction}
          onPress={() => cancelTransactionMutation()}
        />
      )}
    </ScreenContainer>
  );
}
export default TransferDetails;
