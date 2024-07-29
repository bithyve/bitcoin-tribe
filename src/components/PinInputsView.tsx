import React, { useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppText from './AppText';

type pinInputViewProps = {
  passCode?: string;
  height?: number;
  width?: number;
  length?: number;
  showCursor?: boolean;
};

function PinInputsView(props: pinInputViewProps) {
  const {
    passCode,
    height = hp(60),
    width = wp(60),
    length = 4,
    showCursor,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, height, width);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    if (passCode.length === 4) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
  }, [passCode]);
  const getPin = (num: number) => {
    if (passCode.length === num && !hide) {
      return (
        <AppText variant="heading3" style={styles.passcodeText}>
          {passCode[num - 1]}
        </AppText>
      );
    }
    if (passCode.length >= num) {
      return <View style={styles.dotView} />;
    }
    if (passCode.length === num - 1 && showCursor) {
      return <AppText style={styles.cursorStyle}>|</AppText>;
    }
    return '';
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>{getPin(1)}</View>
      <View style={styles.inputWrapper}>{getPin(2)}</View>
      <View style={styles.inputWrapper}>{getPin(3)}</View>
      <View style={styles.inputWrapper}>{getPin(4)}</View>
    </View>
  );
}
const getStyles = (theme: AppTheme, height, width) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: hp(10),
      width: '100%',
      alignItems: 'center',
    },
    inputWrapper: {
      height: height,
      width: width,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.inputBackground,
      marginHorizontal: hp(5),
    },
    passcodeText: {
      color: theme.colors.headingColor,
    },
    cursorStyle: {
      color: theme.colors.accent1,
    },
    dotView: {
      height: 10,
      width: 10,
      borderRadius: 10,
      color: theme.colors.bodyColor,
      backgroundColor: theme.colors.headingColor,
    },
  });
export default PinInputsView;
