import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

type TermAndConditionViewProps = {
  index: number;
  title: string;
  subTitle: string;
};
function TermAndConditionView(props: TermAndConditionViewProps) {
  const { index, title, subTitle } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.indexWrapper}>
        <AppText variant="heading3" style={styles.indexText}>
          {index}.
        </AppText>
      </View>
      <View style={styles.infoWrapper}>
        <AppText variant="heading3" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body2" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(10),
    },
    indexText: {
      color: theme.colors.headingColor,
    },
    indexWrapper: {
      width: '10%',
    },
    infoWrapper: {
      width: '90%',
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default TermAndConditionView;
