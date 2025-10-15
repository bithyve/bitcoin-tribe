import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import QRScanner from 'src/components/QRScanner';

export const ScanQrScreen = ({ navigation, route }) => {
  const { title, subTitle, onCodeScanned } = route.params;
  const styles = getStyles();
  const [isScanning, setIsScanning] = useState(true);

  const onQRScan = data => {
    navigation.goBack();
    onCodeScanned(data);
  };

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <View style={styles.scannerWrapper}>
        <QRScanner onCodeScanned={onQRScan} isScanning={isScanning} />
      </View>
    </ScreenContainer>
  );
};
const getStyles = () =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
    },
  });
