import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from './AppText';
import { hp } from 'src/constants/responsive';
import PrimaryCTA from './PrimaryCTA';

type emptyStateViewProps = {
  title: string;
  subTitle: string;
  IllustartionImage?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ctaTitle?: string;
  onPressCTA?: () => void;
};
function EmptyStateView(props: emptyStateViewProps) {
  const { title, subTitle, IllustartionImage, style, ctaTitle, onPressCTA } =
    props;
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
      {ctaTitle && (
        <View style={styles.ctaWrapper}>
          <PrimaryCTA
            title={ctaTitle}
            onPress={onPressCTA}
            width={'80%'}
            textColor={theme.colors.popupSentCTATitleColor}
            buttonColor={theme.colors.popupSentCTABackColor}
            height={hp(16)}
          />
        </View>
      )}
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
      marginTop: hp(3),
      width: '70%',
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
    },
    illustrationWrapper: {
      marginBottom: hp(20),
    },
    ctaWrapper: {
      marginTop: hp(20),
      width: '100%',
      alignItems: 'center',
    },
  });
export default EmptyStateView;
