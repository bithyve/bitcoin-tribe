import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from './AppText';
import { hp } from 'src/constants/responsive';

type emptyStateViewProps = {
  title: string;
  subTitle: string;
  IllustartionImage?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
function EmptyStateView(props: emptyStateViewProps) {
  const { title, subTitle, IllustartionImage, style } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationWrapper}>{IllustartionImage}</View>
      <AppText variant="heading2" style={styles.titleText}>
        {title}
      </AppText>
      <AppText variant="body2" style={styles.subTitleText}>
        {subTitle}
      </AppText>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '30%',
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
    illustrationWrapper: {
      marginBottom: hp(10),
    },
  });
export default EmptyStateView;
