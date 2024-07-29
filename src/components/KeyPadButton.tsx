import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import AppText from './AppText';

export interface Props {
  title: string;
  onPressNumber;
  keyColor: string;
}
const KeyPadButton: React.FC<Props> = (props: Props) => {
  const theme: AppTheme = useTheme();
  const { title, onPressNumber, keyColor = theme.colors.accent1 } = props;
  const styles = getStyles(theme, keyColor);
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onPressNumber(title)}
      style={styles.keyPadElementTouchable}
      testID={`key_${title}`}>
      <AppText style={styles.keyPadElementText}>{title}</AppText>
    </TouchableOpacity>
  );
};
const getStyles = (theme: AppTheme, keyColor) =>
  StyleSheet.create({
    keyPadElementTouchable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyPadElementText: {
      fontSize: 22,
      lineHeight: 30,
      color: keyColor,
    },
  });
export default KeyPadButton;
