import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from './AppText';

type emptyStateViewProps = {
  title: string;
  subTitle: string;
  IllustartionImage?: ReactNode;
};
function EmptyStateView(props: emptyStateViewProps) {
  const { title, subTitle, IllustartionImage } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <AppText variant="body1" style={styles.titleText}>
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
      marginTop: '40%',
    },
    titleText: {
      color: theme.colors.bodyColor,
    },
    subTitleText: {
      color: theme.colors.bodyColor,
    },
  });
export default EmptyStateView;
