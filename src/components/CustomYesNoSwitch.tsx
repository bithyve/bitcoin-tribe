import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import Colors from 'src/theme/Colors';

type switchProps = {
  value: boolean;
  onValueChange: (text: boolean) => void;
};
const CustomYesNoSwitch = (props: switchProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { value, onValueChange } = props;

  return (
    <AppTouchable onPress={onValueChange} style={styles.switchContainer}>
      <View
        style={[
          styles.switchBackground,
          value ? styles.onBackground : styles.offBackground,
        ]}>
        <View
          style={[
            styles.switchThumb,
            value ? styles.thumbRight : styles.thumbLeft,
          ]}
        />
        <Text style={[styles.switchText, !value && styles.inActiveText]}>
          No
        </Text>
        <Text style={[styles.switchText, value && styles.activeText]}>Yes</Text>
      </View>
    </AppTouchable>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    switchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchBackground: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 100,
      height: 40,
      borderRadius: 25,
    },
    offBackground: {
      backgroundColor: theme.colors.toggleInActiveBtnColor,
    },
    onBackground: {
      backgroundColor: theme.colors.accent1,
    },
    switchThumb: {
      position: 'absolute',
      width: '48%',
      height: '80%',
      borderRadius: 25,
      backgroundColor: Colors.White,
    },
    thumbLeft: {
      left: 5,
    },
    thumbRight: {
      right: 5,
    },
    switchText: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.headingColor, // Inactive text color
      fontSize: 16,
      zIndex: 1, // Make sure text stays above thumb
    },
    activeText: {
      textAlign: 'center',
      marginRight: 5,
      color: Colors.Black, // Active text color
    },
    inActiveText: {
      textAlign: 'center',
      marginLeft: 5,
      color: theme.colors.secondaryHeadingColor, // InActive text color
    },
  });

export default CustomYesNoSwitch;
