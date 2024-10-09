import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Keys } from 'src/storage';
import { useMMKVString } from 'react-native-mmkv';

const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [checkRGBWalletOnline] = useMMKVString(Keys.RGB_WALLET_ONLINE);
  console.log('checkRGBWalletOnline', checkRGBWalletOnline);
  //   useEffect(()=>{

  //   })

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
        <Text style={styles.text}>No network connection</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'red', // SafeAreaView with red background to match the banner
  },
  banner: {
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

export default NetworkBanner;
