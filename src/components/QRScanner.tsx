import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { request, PERMISSIONS, openSettings } from 'react-native-permissions';
import { useTheme } from 'react-native-paper';
import { wp } from 'src/constants/responsive';
import QRBorderCard from './QRBorderCard';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { AppTheme } from 'src/theme';

const QRScanner = () => {
  const device = useCameraDevice('back');
  const [cameraPermission, setCameraPermission] = useState(null);

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(result => {
      if (result == 'granted') {
        setCameraPermission(result);
      } else {
        openSettings();
      }
    });
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: () => {
      // handle the scanned QR value.
    },
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
      marginTop: wp(60),
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