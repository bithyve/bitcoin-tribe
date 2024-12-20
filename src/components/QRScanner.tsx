import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useTheme } from 'react-native-paper';

import { wp } from 'src/constants/responsive';
import QRBorderCard from './QRBorderCard';
import { AppTheme } from 'src/theme';
import CameraUnauthorized from './CameraUnauthorized';

type QRScannerProps = {
  onCodeScanned: (codes: string) => void;
};
const QRScanner = (props: QRScannerProps) => {
  const { onCodeScanned } = props;
  const device = useCameraDevice('back');
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
    onCodeScanned: onCodeScanned,
  });

  return (
    <>
      {cameraPermission != null && device != null ? (
        <View style={styles.qrCodeContainer}>
          <>
            <Camera
              device={device}
              isActive={true}
              style={styles.visionCameraContainer}
              codeScanner={codeScanner}
              enableZoomGesture={true}
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
        </View>
      ) : (
        <CameraUnauthorized />
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
  });

export default QRScanner;
