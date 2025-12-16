import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from 'react-native-paper';

import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';

const NodeConnected = () => {
  const { isNodeConnect } = useContext(AppContext);
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
      backgroundColor: Colors.GOGreen,
      paddingVertical: windowHeight > 820 ? hp(3) : 0,
      alignItems: 'center',
      width:windowWidth,
      height:hp(25),
      justifyContent:"center"
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default NodeConnected;
