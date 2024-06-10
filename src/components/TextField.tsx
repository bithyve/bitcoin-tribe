import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';

import { hp, wp } from '../constants/responsive';

type TextFieldProps = {
  icon?: any;
  placeholder?: string;
  value: string;
  keyboardType?: any;
  onChangeText: any;
};

const TextField = (props: TextFieldProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {props.icon && <View style={styles.iconWrapper}>{props.icon}</View>}
      <TextInput
        cursorColor={theme.colors.accent1}
        textColor={theme.colors.heading}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.placeholderColor}
        style={styles.inputContainer}
        underlineStyle={styles.underlineStyle}
        contentStyle={[CommonStyles.textFieldLabel, styles.textStyles]}
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
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
    },
    inputContainer: {
      height: hp(50),
      width: '80%',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 15,
      borderTopLeftRadius: 20,
      paddingLeft: 5,
    },
    iconWrapper: {
      width: '15%',
      borderRightWidth: 1,
      borderRightColor: theme.colors.heading,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyles: {
      color: theme.colors.headingColor,
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
  });

export default TextField;
