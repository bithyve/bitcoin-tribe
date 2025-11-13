import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { formatTUsdt } from 'src/utils/snakeCaseToCamelCaseCase';

type labelContentProps = {
  label: string;
  content: string;
  contentUnderline?: boolean;
  selectable?: boolean;
};
function TransferLabelContent(props: labelContentProps) {
  const { label, content, contentUnderline = false, selectable = false } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <View style={styles.wrapper}>
      <AppText variant="body1" style={styles.labelStyle}>
        {label}
      </AppText>
      <AppText
        variant="body2"
        selectable={selectable}
        style={[styles.textStyle, contentUnderline && { textDecorationLine: 'underline' }]}>
        {formatTUsdt(content)}
      </AppText>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: hp(5),
      width: '100%',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    labelStyle: {
      color: theme.colors.headingColor,
      flex: 2,
    },
    textStyle: {
      lineHeight: 20,
      color: theme.colors.secondaryHeadingColor,
      flexWrap: 'wrap',
      textAlign: 'left',
      flex: 3,
    },
  });
export default TransferLabelContent;
