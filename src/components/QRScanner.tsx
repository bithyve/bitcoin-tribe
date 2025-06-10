import React, { useContext, useEffect, useState } from 'react';
import logger from 'src/utils/logger';
import {
  View,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useTheme } from 'react-native-paper';
import RNQRGenerator from 'rn-qr-generator';

import { wp } from 'src/constants/responsive';
import QRBorderCard from './QRBorderCard';
import { AppTheme } from 'src/theme';
import CameraUnauthorized from './CameraUnauthorized';
import UploadImageCta from 'src/components/UploadImageCta';
import UploadIcon from 'src/assets/images/upload.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import pickImage from 'src/utils/imagePicker';
import Toast from './Toast';

type QRScannerProps = {
  onCodeScanned: (codes: Code[]) => void;
  isScanning: boolean;
};

const QRScanner = (props: QRScannerProps) => {
  const { onCodeScanned, isScanning = true } = props;
  const device = useCameraDevice('back');
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const [cameraPermission, setCameraPermission] = useState(null);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request permission for Android
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraPermission('granted');
        } else {
          // openSettings();
        }
      } else if (Platform.OS === 'ios') {
        // Request permission for iOS
        const status = await Camera.getCameraPermissionStatus();

        if (status === 'granted') {
          setCameraPermission('granted');
        } else if (status === 'not-determined') {
          const newStatus = await Camera.requestCameraPermission();
          setCameraPermission(
            newStatus === 'authorized' ? 'granted' : 'denied',
          );
        } else {
          // openSettings();
          // showPermissionDeniedAlert();
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestCameraPermission();
    // Listen to AppState changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        requestCameraPermission(); // Re-check permissions when app returns to foreground
      }
    });

    // Cleanup the AppState listener
    return () => {
      subscription.remove();
    };
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      onCodeScanned(codes);
      // if (isScanning) {
      //   setIsScanning(false); // Stop scanning after detecting a QR code
      //   onCodeScanned(codes); // Pass the detected codes
      // }
    },
  });

  const handlePickImage = async () => {
    try {
      const result = await pickImage(false);
      if (!result) {
        return;
      }
      RNQRGenerator.detect({
        uri: result,
      })
        .then(response => {
          if (response?.values?.[0]) {
            onCodeScanned([
              {
                value: response.values[0],
              },
            ] as any);
          } else {
            Toast('Error in scanning Qr code', true);
          }
        })
        .catch(error => logger.error('Cannot detect QR code in image', error));
    } catch (error) {
      console.error('QRreader failed:', error.message || error);
    }
  };

  return (
    <>
      {cameraPermission != null && device != null ? (
        <>
          <View style={styles.qrCodeContainer}>
            <>
              {isScanning && (
                <Camera
                  device={device}
                  isActive={true}
                  style={styles.visionCameraContainer}
                  codeScanner={codeScanner}
                  enableZoomGesture={true}
                />
              )}
              <View
                style={[styles.visionCameraContainer, styles.outSideBorder]}>
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
          </View>
          <View style={styles.uploadImageCtaWrapper}>
            <UploadImageCta
              title={sendScreen.uploadFromGallery}
              onPress={() => handlePickImage()}
              icon={<UploadIcon />}
            />
          </View>
        </>
      ) : (
        <>
          <CameraUnauthorized />
          <View style={styles.uploadImageCtaWrapper}>
            <UploadImageCta
              title={sendScreen.uploadFromGallery}
              onPress={() => handlePickImage()}
              icon={<UploadIcon />}
            />
          </View>
        </>
      )}
    </>
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
    uploadImageCtaWrapper: {
      alignItems: 'center',
    },
  });

export default QRScanner;
