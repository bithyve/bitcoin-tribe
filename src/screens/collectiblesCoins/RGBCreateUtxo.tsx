import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import RGBCreateUtxoContainer from './components/RGBCreateUtxoContainer';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import UTXOConfirmationModalContainer from './components/UTXOConfirmationModalContainer';
import dbManager from 'src/storage/realm/dbManager';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import { AverageTxFeesByNetwork } from 'src/services/wallets/interfaces';
import { Keys } from 'src/storage';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { useNavigation, useRoute } from '@react-navigation/native';

function RGBCreateUtxo() {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, sendScreen } = translations;
  const [visible, setVisible] = useState(false);
  const [averageTxFeeJSON] = useMMKVString(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet);
  const averageTxFeeByNetwork: AverageTxFeesByNetwork =
    JSON.parse(averageTxFeeJSON);
  const averageTxFee = averageTxFeeByNetwork[wallet.networkType];
  const createUtxos = useMutation(ApiHandler.createUtxos);

  useEffect(() => {
    if (createUtxos.data) {
      setTimeout(() => {
        setVisible(true);
      }, 400);
    } else if (createUtxos.data === false) {
      Toast(walletTranslation.failedToCreateUTXO, false, true);
    }
  }, [createUtxos.data]);

  return (
    <ScreenContainer>
      <AppHeader
        title={walletTranslation.confirmation}
        subTitle={''}
        enableBack={true}
      />
      <ModalLoading visible={createUtxos.isLoading} />
      <RGBCreateUtxoContainer
        primaryOnPress={() => {
          createUtxos.mutate();
        }}
      />
      <ResponsePopupContainer
        visible={visible}
        title={sendScreen.sendSuccessTitle}
        subTitle={sendScreen.sendSuccessSubTitle}
        onDismiss={() => setVisible(false)}
        backColor={theme.colors.successPopupBackColor}
        borderColor={theme.colors.successPopupBorderColor}
        conatinerModalStyle={styles.containerModalStyle}>
        <UTXOConfirmationModalContainer
          numOfUtxo={5}
          amountPerUTXO={1000}
          transFee={averageTxFee.high.averageTxFee}
          total={5000 + averageTxFee.high.averageTxFee}
          onPress={() => {
            setVisible(false);
            route.params?.refresh();
            navigation.goBack();
          }}
        />
      </ResponsePopupContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerModalStyle: {
      margin: 0,
      padding: 10,
    },
  });
export default RGBCreateUtxo;
