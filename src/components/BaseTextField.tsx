import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';

import { hp } from '../constants/responsive';

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
        cursorColor={theme.colors.buyCTA}
        textColor={theme.colors.headingColor}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.placeholderColor}
        style={styles.inputContainer}
        contentStyle={CommonStyles.textFieldLabel}
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
      height: hp(50),
      width: '80%',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
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
