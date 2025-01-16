import React, { useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Code } from 'react-native-vision-camera';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useRoute } from '@react-navigation/native';
import Toast from 'src/components/Toast';
import config from 'src/utils/config';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';

function ScanAssetScreen({ route, navigation }) {
  const { assetId, wallet, rgbInvoice, item } = useRoute().params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);

  const onCodeScanned = useCallback((codes: Code[]) => {
    const value = codes[0]?.value;
    if (value == null) {
      return;
    }
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let { type: paymentInfoKind } = WalletUtilities.addressDiff(value, network);
    switch (paymentInfoKind) {
      case PaymentInfoKind.RGB_INVOICE:
        navigation.replace(NavigationRoutes.SENDASSET, {
          assetId: assetId,
          wallet: wallet,
          rgbInvoice: value,
        });
        break;
      default:
        Toast(sendScreen.invalidRGBInvoiceAddress, true);
    }
  }, []);

  return (
    <ScreenContainer>
      <AppHeader
        title={sendScreen.sendAssetTitle}
        subTitle={sendScreen.sendAssetSubtitle}
        enableBack={true}
      />
      <View style={styles.scannerWrapper}>
        <QRScanner onCodeScanned={onCodeScanned} />
      </View>
      <OptionCard
        title={sendScreen.enterInvoiceManually}
        // subTitle={sendScreen.sendAssetOptionCardSubTitle}
        onPress={() => {
          navigation.replace(NavigationRoutes.SENDASSET, {
            assetId: assetId,
            wallet: wallet,
            rgbInvoice: rgbInvoice,
          });
        }}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
    },
  });
export default ScanAssetScreen;
