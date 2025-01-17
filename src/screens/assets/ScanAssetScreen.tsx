import React, { useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Code } from 'react-native-vision-camera';
import { useQuery } from '@realm/react';
import { useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Toast from 'src/components/Toast';
import config from 'src/utils/config';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';

function ScanAssetScreen({ route, navigation }) {
  const { assetId, wallet, rgbInvoice } = useRoute().params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, assets } = translations;
  const styles = getStyles(theme);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const coins = useQuery(RealmSchema.Coin);
  const collectibles = useQuery(RealmSchema.Collectible);
  const combinedData = [...coins, ...collectibles];

  const handlePaymentInfo = useCallback(
    async (input: { codes?: Code[]; paymentInfo?: string }) => {
      const { codes, paymentInfo } = input;
      const value = paymentInfo || codes?.[0]?.value;

      if (!value) {
        return;
      }

      if (value.startsWith('rgb:')) {
        const res = await ApiHandler.decodeInvoice(value);
        if (res.assetId) {
          const assetData = combinedData.filter(
            item => item.assetId === res.assetId,
          );
          if (assetData.length === 0) {
            Toast(assets.assetNotFoundMsg, true);
            navigation.goBack();
          } else {
            navigation.replace(NavigationRoutes.SENDASSET, {
              assetId: res.assetId,
              wallet: wallet,
              rgbInvoice: value,
              amount: res.amount.toString(),
            });
          }
        } else {
          navigation.replace(NavigationRoutes.SENDASSET, {
            assetId: assetId,
            wallet: wallet,
            rgbInvoice: value,
            amount: 0,
          });
        }
        return;
      }

      if (value.startsWith('lnbc')) {
        navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
          invoice: value,
        });
        return;
      }

      const network = WalletUtilities.getNetworkByType(
        paymentInfo ? app.networkType : config.NETWORK_TYPE,
      );
      let {
        type: paymentInfoKind,
        address,
        amount,
      } = WalletUtilities.addressDiff(value, network);

      if (amount) {
        amount = Math.trunc(amount * 1e8); // Convert from bitcoins to sats
      }

      switch (paymentInfoKind) {
        case PaymentInfoKind.RLN_INVOICE:
          navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
            invoice: value,
          });
          break;
        default:
          Toast(sendScreen.invalidRGBInvoiceAddress, true);
      }
    },
    [wallet, navigation],
  );

  const onCodeScanned = async (codes: Code[]) => {
    await handlePaymentInfo({ codes });
  };

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
