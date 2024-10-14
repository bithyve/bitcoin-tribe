import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';

const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null; // Don't display banner if connected

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.text}>{common.noInternet}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.ImperialRed, // SafeAreaView with red background to match the banner
  },
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 8,
    left: 0,
    right: 0,
    backgroundColor: Colors.ImperialRed,
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

export default NetworkBanner;
