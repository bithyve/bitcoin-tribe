import React, { useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';

const RGBWalletStatus = () => {
  const { isWalletOnline } = useContext(AppContext); // Access the context
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return isWalletOnline === false ? (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <AppText style={styles.text}>{common.rgbWalletOffline}</AppText>
      </View>
    </SafeAreaView>
  ) : null;
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.FireOpal,
  },
  errorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 8,
    left: 0,
    right: 0,
    backgroundColor: Colors.FireOpal,
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
