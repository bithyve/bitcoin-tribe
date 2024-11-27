import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp, windowWidth } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

type OnboardingSlidesProps = {
  title: string;
  subTitle: string;
  illustration: React.ReactNode;
  paragraph: string;
  currentPosition: number;
  navigation?: any;
};

function OnboardingSlideComponent(props: OnboardingSlidesProps) {
  const {
    title,
    subTitle,
    illustration,
    paragraph,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.wrapper}>
      <View style={styles.contentWrapper1}>
        <AppText variant="heading1" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="heading3" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>{illustration}</View>
      <View style={styles.contentWrapper2}>
        <AppText variant="heading3" style={styles.infoText}>
          {paragraph}
        </AppText>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: windowWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 5,
      flex: 1,
      paddingHorizontal: hp(10),
    },
    contentWrapper1: {
      height: '30%',
      width: '100%',
      marginVertical: hp(20),
      alignItems: 'center',
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: '50%',
      width: '100%',
    },
    contentWrapper2: {
      height: '10%',
      width: '100%',
      marginVertical: hp(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
      fontSize: 30,
      color: theme.colors.headingColor,
      textAlign: 'center',
      flexWrap: 'wrap',
    },
    subTitleText: {
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
      flexWrap: 'wrap',
    },
    infoText: {
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default OnboardingSlideComponent;
