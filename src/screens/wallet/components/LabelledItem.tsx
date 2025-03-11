import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';

type labelledItemProps = {
  label: string;
  content: string;
};
function LabelledItem(props: labelledItemProps) {
  const { label, content } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <View style={styles.wrapper}>
      <AppText variant="heading3" style={styles.labelStyle}>
        {label}
      </AppText>
      <AppText variant="body2" style={styles.textStyle}>
        {content}
      </AppText>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: hp(10),
      flexDirection: 'row',
      width: '100%',
      paddingBottom: hp(15),
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
    },
    labelStyle: {
      color: theme.colors.headingColor,
      width: '85%',
    },
    textStyle: {
      lineHeight: 20,
      color: theme.colors.secondaryHeadingColor,
      width: '15%',
      textAlign: 'right',
    },
  });
export default LabelledItem;
