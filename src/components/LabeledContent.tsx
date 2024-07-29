import React from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppText from './AppText';

type labelContentProps = {
  label: string;
  content: string;
};
function LabeledContent(props: labelContentProps) {
  const { label, content } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.wrapper}>
      <AppText variant="body1" style={styles.labelStyle}>
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
    },
    labelStyle: {
      color: theme.colors.accent3,
    },
    textStyle: {
      color: theme.colors.headingColor,
    },
  });
export default LabeledContent;
