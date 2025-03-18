import React, { useState, useContext, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useQuery } from '@realm/react';
import { useTheme } from 'react-native-paper';
import { Code } from 'react-native-vision-camera';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import { hp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { Asset, Coin, Collectible } from 'src/models/interfaces/RGBWallet';
import ModalLoading from 'src/components/ModalLoading';

function SendScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, assets } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const [validatingInvoiceErrorMsg, setValidatingInvoiceErrorMsg] =
    useState('');
  const [isScanning, setIsScanning] = useState(true);
  const { receiveData, title, subTitle, wallet } = route.params;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const allAssets: Asset[] = [...coins, ...collectibles];

  const navigateWithDelay = (callback: () => void) => {
    setVisible(false);
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const handlePaymentInfo = useCallback(
    async (
      input: { codes?: Code[]; paymentInfo?: string },
      triggerSource: 'scan' | 'proceed',
    ) => {
      setIsScanning(false);
      const { codes, paymentInfo } = input;
      const value = paymentInfo || codes?.[0]?.value;

      if (!value) {
        setIsScanning(true);
        return;
      }
      if (value.startsWith('rgb:')) {
        try {
          const res = await ApiHandler.decodeInvoice(value);
          if (res.assetId) {
            const assetData = allAssets.find(
              item => item.assetId === res.assetId,
            );
            if (!assetData) {
              setIsScanning(true);
              if (triggerSource === 'scan') {
                Toast(assets.assetNotFoundMsg, true);
              } else {
                setValidatingInvoiceErrorMsg(assets.assetNotFoundMsg);
              }
            } else {
              setIsScanning(true);
              navigateWithDelay(() => {
                navigation.replace(NavigationRoutes.SENDASSET, {
                  assetId: res.assetId,
                  wallet: wallet,
                  rgbInvoice: value,
                  amount: res.amount.toString(),
                });
              });
            }
          } else {
            setIsScanning(true);
            navigateWithDelay(() => {
              navigation.replace(NavigationRoutes.SELECTASSETTOSEND, {
                wallet,
                rgbInvoice: value,
                assetID: '',
                amount: '',
              });
            });
          }
          return;
        } catch (error) {
          setIsScanning(true);
          setValidatingInvoiceErrorMsg('Failed to decode RGB invoice.');
          return;
        }
      }
      if (value.startsWith('lnbc')) {
        setIsScanning(true);
        setVisible(false);
        navigateWithDelay(() => {
          navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
            invoice: value,
          });
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
        case PaymentInfoKind.ADDRESS:
          setIsScanning(true);
          navigateWithDelay(() => {
            navigation.navigate(NavigationRoutes.SENDTO, { wallet, address });
          });
          break;
        case PaymentInfoKind.PAYMENT_URI:
          setIsScanning(true);
          navigateWithDelay(() => {
            navigation.navigate(NavigationRoutes.SENDTO, {
              wallet,
              address,
              paymentURIAmount: amount,
            });
          });
          break;
        case PaymentInfoKind.RLN_INVOICE:
          setIsScanning(true);
          navigateWithDelay(() => {
            navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
              invoice: value,
            });
          });
          break;
        default:
          setIsScanning(true);
          if (triggerSource === 'scan') {
            Toast(sendScreen.invalidBtcAndRgbInput, true);
          } else {
            setValidatingInvoiceErrorMsg(sendScreen.invalidBtcAndRgbInput);
          }
      }
    },
    [wallet, navigation],
  );

  const onCodeScanned = async (codes: Code[]) => {
    await handlePaymentInfo({ codes }, 'scan');
  };
  const onProceed = async (paymentInfo: string) => {
    await handlePaymentInfo({ paymentInfo }, 'proceed');
  };

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <View>
        <ModalLoading visible={!isScanning} />
      </View>
      <View style={styles.scannerWrapper}>
        {!visible && (
          <QRScanner onCodeScanned={onCodeScanned} isScanning={isScanning} />
        )}
      </View>
      <OptionCard
        title={sendScreen.optionCardTitle}
        // subTitle={sendScreen.optionCardSubTitle}
        onPress={() => {
          receiveData === 'send'
            ? setVisible(true)
            : navigation.navigate(NavigationRoutes.CONNECTNODEMANUALLY);
        }}
      />
      <ModalContainer
        title={sendScreen.enterSendAddressInvoice}
        subTitle={sendScreen.enterSendAdrsInvoiceSubTitle}
        visible={visible}
        enableCloseIcon={false}
        height={Platform.OS == 'ios' && '85%'}
        onDismiss={() => {
          setValidatingInvoiceErrorMsg('');
          setVisible(false);
        }}>
        <SendEnterAddress
          onDismiss={() => {
            setValidatingInvoiceErrorMsg('');
            setVisible(false);
          }}
          onProceed={address => onProceed(address)}
          errorMessage={validatingInvoiceErrorMsg}
        />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
      marginTop: hp(20),
    },
  });
export default SendScreen;
