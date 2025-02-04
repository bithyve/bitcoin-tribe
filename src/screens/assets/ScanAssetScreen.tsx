import React, { useCallback, useContext, useState } from 'react';
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
import { Asset, Coin, Collectible } from 'src/models/interfaces/RGBWallet';

function ScanAssetScreen({ navigation }) {
  const { assetId, rgbInvoice } = useRoute().params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, assets } = translations;
  const styles = getStyles(theme);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const udas = useQuery<Collectible[]>(RealmSchema.UniqueDigitalAsset);
  const allAssets: Asset[] = [...coins, ...collectibles, ...udas];
  const [isScanning, setIsScanning] = useState(true);

  const handlePaymentInfo = useCallback(
    async (input: { codes?: Code[]; paymentInfo?: string }) => {
      setIsScanning(false);
      const { codes, paymentInfo } = input;
      const value = paymentInfo || codes?.[0]?.value;

      if (!value) {
        setIsScanning(true);
        return;
      }

      if (value.startsWith('rgb:')) {
        const res = await ApiHandler.decodeInvoice(value);
        if (res.assetId) {
          const assetData = allAssets.find(
            item => item.assetId === res.assetId,
          );
          if (!assetData) {
            setIsScanning(true);
            Toast(assets.assetNotFoundMsg, true);
            navigation.goBack();
          } else {
            setIsScanning(true);
            navigation.replace(NavigationRoutes.SENDASSET, {
              assetId: res.assetId,
              rgbInvoice: value,
              amount: res.amount.toString(),
            });
          }
        } else {
          setIsScanning(true);
          navigation.replace(NavigationRoutes.SENDASSET, {
            assetId: assetId,
            rgbInvoice: value,
            amount: 0,
          });
        }
        return;
      }

      if (value.startsWith('lnbc')) {
        setIsScanning(true);
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
          setIsScanning(true);
          navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
            invoice: value,
          });
          break;
        default:
          setIsScanning(true);
          Toast(sendScreen.invalidRGBInvoiceAddress, true);
      }
    },
    [navigation],
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
        <QRScanner onCodeScanned={onCodeScanned} isScanning={isScanning} />
      </View>
      <OptionCard
        title={sendScreen.enterInvoiceManually}
        // subTitle={sendScreen.sendAssetOptionCardSubTitle}
        onPress={() => {
          navigation.replace(NavigationRoutes.SENDASSET, {
            assetId: assetId,
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
