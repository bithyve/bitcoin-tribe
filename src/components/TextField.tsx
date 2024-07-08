import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import CommonStyles from 'src/common/styles/CommonStyles';
import { AppTheme } from 'src/theme';

type TextFieldProps = {
  icon?: React.ReactNode;
  placeholder?: string;
  value: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onChangeText: (text: string) => void;
  maxLength?: number;
  disabled?: boolean;
  returnKeyType?: 'done';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
};

const TextField = (props: TextFieldProps) => {
  const {
    icon,
    placeholder,
    value,
    keyboardType,
    onChangeText,
    maxLength,
    disabled = false,
    returnKeyType='done',
    onSubmitEditing,
    autoFocus=false
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, icon), [theme, icon]);
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <TextInput
        disabled={disabled}
        cursorColor={theme.colors.accent1}
        selectionColor={theme.colors.accent1}
        textColor={theme.colors.headingColor}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={styles.inputContainer}
        underlineStyle={styles.underlineStyle}
        contentStyle={[CommonStyles.textFieldLabel, styles.textStyles]}
        value={value}
        onChangeText={text => onChangeText(text)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        maxFontSizeMultiplier={1}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
      />
    </View>
  );
};
const getStyles = (theme: AppTheme, icon) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
    },
    inputContainer: {
      justifyContent: 'center',
      height: hp(50),
      width: icon ? '80%' : '100%',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 15,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingLeft: 5,
    },
    iconWrapper: {
      width: '15%',
      borderRightWidth: 1,
      borderRightColor: theme.colors.headingColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyles: {
      color: theme.colors.headingColor,
      marginTop: hp(3),
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
  });

export default TextField;
