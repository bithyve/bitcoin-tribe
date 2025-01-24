import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SupportIllustration from 'src/assets/images/supportLearnMoreIllustration.svg';
import AppText from 'src/components/AppText';

function SupportLearnMore() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.supported} />
      <ScrollView style={styles.wrapper}>
        <View>
          <AppText variant="body1" style={styles.titleText}>
            {onBoarding.supportLearnMoreSubtitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <SupportIllustration />
        </View>
        <View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.supportLearnMoreLabel1}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.supportLearnMoreContent1}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.supportLearnMoreLabel2}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.supportLearnMoreContent2}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.supportLearnMoreLabel3}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.supportLearnMoreContent3}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.supportLearnMoreContent4}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {},
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(30),
    },
    contentWrapper: {
      marginVertical: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
      marginBottom: hp(3),
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default SupportLearnMore;
