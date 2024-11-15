import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import CommonStyles from 'src/common/styles/CommonStyles';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import AppTouchable from './AppTouchable';

type TextFieldProps = {
  icon?: React.ReactNode;
  placeholder?: string;
  value: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onChangeText: (text: string) => void;
  maxLength?: number;
  disabled?: boolean;
  returnKeyType?: 'done' | 'Enter';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  rightText?: string;
  onRightTextPress?: () => void;
  rightCTAStyle?: StyleProp<TextStyle>;
  rightCTATextColor?: string;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  multiline?: boolean;
  numberOfLines?: number;
  onContentSizeChange?: (event) => void;
  secureTextEntry?: boolean;
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
    returnKeyType = 'done',
    onSubmitEditing,
    autoFocus = false,
    rightText,
    onRightTextPress,
    rightCTAStyle,
    rightCTATextColor,
    inputStyle,
    style,
    autoCapitalize = undefined,
    multiline = false,
    numberOfLines,
    onContentSizeChange,
    contentStyle,
    secureTextEntry = false,
  } = props;
  const [isFocused, setIsFocused] = useState(false);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, icon, rightText, rightCTATextColor, isFocused),
    [theme, icon, rightText, rightCTATextColor, isFocused],
  );

  return (
    <View style={[styles.container, style, isFocused && styles.outlineStyle]}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <TextInput
        // mode="outlined"
        // outlineColor={disabled ? 'transparent' : theme.colors.inputBackground}
        // activeOutlineColor={theme.colors.accent1}
        // outlineStyle={styles.outlineStyle}
        disabled={disabled}
        cursorColor={theme.colors.accent1}
        selectionColor={theme.colors.accent1}
        textColor={theme.colors.headingColor}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.inputContainer, inputStyle]}
        underlineStyle={styles.underlineStyle}
        contentStyle={[
          CommonStyles.textFieldLabel,
          styles.textStyles,
          contentStyle,
        ]}
        value={value}
        onChangeText={text => onChangeText(text)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        maxFontSizeMultiplier={1}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onContentSizeChange={onContentSizeChange}
        // contentStyle={contentStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
      />
      {rightText && (
        <AppTouchable
          style={[styles.rightTextWrapper, rightCTAStyle]}
          onPress={onRightTextPress}>
          <AppText variant="smallCTA" style={styles.rightTextStyle}>
            {rightText}
          </AppText>
        </AppTouchable>
      )}
    </View>
  );
};
const getStyles = (
  theme: AppTheme,
  icon,
  rightText,
  rightCTATextColor = theme.colors.accent1,
) =>
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
      height: hp(60),
      width: icon ? (rightText ? '60%' : '85%') : '100%',
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
      opacity: 0.6,
    },
    textStyles: {
      color: theme.colors.headingColor,
      // marginTop: hp(5),
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
    rightTextStyle: {
      color: rightCTATextColor,
    },
    rightTextWrapper: {
      width: '20%',
      alignItems: 'center',
      // marginTop: hp(5),
    },
    outlineStyle: {
      borderRadius: 15,
      borderColor: theme.colors.accent1,
      borderWidth: 1.5,
    },
  });

export default TextField;
