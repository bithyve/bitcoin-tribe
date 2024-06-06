import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import Fonts from '../constants/Fonts';

type BaseTextFieldProps = {
  icon?: any;
  placeholder?: string;
  value: string;
  keyboardType?: any;
};

const BaseTextField = (props: BaseTextFieldProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>{props.icon}</View>
      <TextInput
        underlineColor="transparent"
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.placeholderColor}
        style={styles.inputContainer}
        value={props.value}
        onChangeText={text => props.onChangeText(text)}
        keyboardType={props.keyboardType}
      />
    </View>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme.colors.inputBackground,
    },
    inputContainer: {
      height: 50,
      width: '80%',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: Fonts.PoppinsBold,
    },
    iconWrapper: {
      width: '15%',
      borderRightWidth: 1,
      borderRightColor: theme.colors.headingColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default BaseTextField;
