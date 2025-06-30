import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from 'react-native-paper';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';

const NodeConnected = () => {
  const { isNodeConnect } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);

  return isNodeConnect ? (
    <View style={styles.banner}>
      <Text style={styles.text}>{'Connection successful.'}</Text>
    </View>
  ) : null;
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    banner: {
      position: Platform.OS === 'ios' ? 'absolute' : 'relative',
      top: hasNotch
        ? 40
        : Platform.OS === 'ios' && windowHeight > 820
        ? 50
        : Platform.OS === 'android'
        ? 35
        : 16,
      left: 0,
      right: 0,
      backgroundColor: Colors.GOGreen,
      zIndex: 1000,
      paddingVertical: windowHeight > 820 ? hp(3) : 0,
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default NodeConnected;
