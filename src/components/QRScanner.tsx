import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { request, PERMISSIONS, openSettings } from 'react-native-permissions';
import { useTheme } from 'react-native-paper';
import { wp } from 'src/constants/responsive';
import QRBorderCard from './QRBorderCard';
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { useNavigation } from '@react-navigation/native';
import config from 'src/utils/config';
import Toast from './Toast';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useWallets from 'src/hooks/useWallets';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const QRScanner = () => {
  const device = useCameraDevice('back');
  const [cameraPermission, setCameraPermission] = useState(null);
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const wallet: Wallet = useWallets({}).wallets[0];
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;

  useEffect(() => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(result => {
      if (result === 'granted') {
        setCameraPermission(result);
      } else {
        openSettings();
      }
    });
  }, []);

  const onCodeScanned = useCallback((codes: Code[]) => {
    const value = codes[0]?.value;
    if (value == null) {
      return;
    }
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let {
      type: paymentInfoKind,
      address,
      amount,
    } = WalletUtilities.addressDiff(value, network);
    if (amount) {
      amount = Math.trunc(amount * 1e8);
    } // convert from bitcoins to sats
    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        navigation.replace(NavigationRoutes.SENDTO, { wallet, address });
        break;
      case PaymentInfoKind.PAYMENT_URI:
        navigation.replace(NavigationRoutes.SENDTO, {
          wallet,
          address,
          paymentURIAmount: amount,
        });
        break;
      case PaymentInfoKind.RGB_INVOICE:
        navigation.replace(NavigationRoutes.SENDASSET, {
          wallet,
          address,
          rgbInvoice: value,
        });
        break;
      default:
        Toast(sendScreen.invalidBtcAddress, false, true);
    }
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: onCodeScanned,
  });

  return (
    <View style={styles.qrCodeContainer}>
      {cameraPermission != null && device && (
        <>
          <Camera
            device={device}
            isActive={true}
            style={styles.visionCameraContainer}
            codeScanner={codeScanner}
          />
          <View style={[styles.visionCameraContainer, styles.outSideBorder]}>
            <View style={styles.scannerInnerBorderWrapper}>
              <View style={styles.qrScannerRowStyle}>
                <QRBorderCard style={styles.borderLeftTopWidth} />
                <QRBorderCard style={styles.borderRightTopWidth} />
              </View>
              <View style={styles.qrScannerRowStyle}>
                <QRBorderCard style={styles.borderLeftBottomWidth} />
                <QRBorderCard style={styles.borderRightBottomWidth} />
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    qrCodeContainer: {
      height: wp(340),
      width: wp(330),
      alignSelf: 'center',
      justifyContent: 'center',
      marginTop: wp(50),
      borderRadius: wp(8),
      overflow: 'hidden',
    },
    qrScannerRowStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    visionCameraContainer: {
      height: wp(340),
      width: wp(330),
    },
    outSideBorder: { position: 'absolute' },
    scannerInnerBorderWrapper: {
      height: wp(310),
      width: wp(310),
      justifyContent: 'space-between',
      alignSelf: 'center',
      marginTop: wp(15),
    },
    borderLeftTopWidth: {
      borderTopWidth: 1,
      borderLeftWidth: 1,
    },
    borderLeftBottomWidth: {
      borderBottomWidth: 1,
      borderLeftWidth: 1,
    },
    borderRightBottomWidth: {
      borderBottomWidth: 1,
      borderRightWidth: 1,
    },
    borderRightTopWidth: {
      borderTopWidth: 1,
      borderRightWidth: 1,
    },
  });

export default QRScanner;
