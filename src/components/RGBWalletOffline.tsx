import React, { useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const RGBWalletStatus = () => {
  const { checkRGBWalletOnline } = useContext(AppContext); // Access the context
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return checkRGBWalletOnline === false ? (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <AppText style={styles.text}>{common.rgbWalletOffline}</AppText>
      </View>
    </SafeAreaView>
  ) : null;
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'red',
  },
  errorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 8,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    padding: 20,
    zIndex: 1000, // Ensures the banner is above everything
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RGBWalletStatus;
