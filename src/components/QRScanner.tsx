import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import { useTheme } from 'react-native-paper';
import { wp } from 'src/constants/responsive';
import QRBorderCard from './QRBorderCard';

type QRScannerProps = {
  onBarCodeRead: (event: BarCodeReadEvent) => void;
};

const QRScanner = (props: QRScannerProps) => {
  const { onBarCodeRead } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.qrCodeContainer}>
      <RNCamera
        autoFocus="on"
        useNativeZoom
        style={styles.camera}
        captureAudio={false}
        onBarCodeRead={onBarCodeRead}
        ratio={'16:9'}>
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
      </RNCamera>
    </View>
  );
};

const getStyles = theme =>
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
    camera: {
      height: wp(340),
      width: wp(330),
    },
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
