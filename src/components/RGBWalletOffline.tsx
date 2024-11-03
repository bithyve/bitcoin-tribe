import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import AppType from 'src/models/enums/AppType';

const RGBWalletStatus = () => {
  const { isWalletOnline, appType } = useContext(AppContext); // Access the context
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const msg = useMemo(() => {
    return appType === AppType.NODE_CONNECT
      ? common.rgbNodeOffline
      : common.rgbWalletOffline;
  }, []);

  return isWalletOnline === false ? (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <AppText style={styles.text}>{msg}</AppText>
      </View>
    </SafeAreaView>
  ) : null;
};

const styles = StyleSheet.create({
  safeArea: {
    height: '7%',
    backgroundColor: Colors.FireOpal,
  },
  errorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? -10 : -15,
    backgroundColor: Colors.FireOpal,
    padding: 20,
    zIndex: 1000, // Ensures the banner is above everything
    elevation: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RGBWalletStatus;
