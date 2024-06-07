import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';
import Fonts from '../constants/Fonts';

type TextFieldProps = {
  placeholder?: string;
  value: string;
  keyboardType?: any;
};

const TextField = (props: TextFieldProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <TextInput
      underlineColor="transparent"
      placeholder={props.placeholder}
      cursorColor={theme.colors.buyCTA}
      textColor={theme.colors.headingColor}
      placeholderTextColor={theme.colors.placeholderColor}
      style={styles.container}
      contentStyle={CommonStyles.textFieldLabel}
      value={props.value}
      onChangeText={text => props.onChangeText(text)}
      keyboardType={props.keyboardType}
    />
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: 50,
      width: '95%',
      borderRadius: 6,
      margin: 10,
      backgroundColor: theme.colors.inputBackground,
    },
  });

export default TextField;
