import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import CommonStyles from 'src/common/styles/CommonStyles';
import { AppTheme } from 'src/theme';

type TextFieldProps = {
  icon?: any;
  placeholder?: string;
  value: string;
  keyboardType?: any;
  onChangeText: any;
};

const TextField = (props: TextFieldProps) => {
  const { icon, placeholder, value, keyboardType, onChangeText } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <TextInput
        cursorColor={theme.colors.accent1}
        textColor={theme.colors.headingColor}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={styles.inputContainer}
        underlineStyle={styles.underlineStyle}
        contentStyle={[CommonStyles.textFieldLabel, styles.textStyles]}
        value={value}
        onChangeText={text => onChangeText(text)}
        keyboardType={keyboardType}
      />
    </View>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
    },
    inputContainer: {
      height: hp(55),
      width: '80%',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 15,
      borderTopLeftRadius: 20,
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
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
  });

export default TextField;
