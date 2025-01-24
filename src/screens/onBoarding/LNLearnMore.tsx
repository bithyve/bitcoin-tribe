import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LNLearnMoreIllustration from 'src/assets/images/lnLearnMoreIllustration.svg';
import AppText from 'src/components/AppText';

function LNLearnMore() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.mainnetAndLightning} />
      <ScrollView style={styles.wrapper}>
        <View>
          <AppText variant="body1" style={styles.titleText}>
            {onBoarding.lnLearnMoreSubtitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <LNLearnMoreIllustration />
        </View>
        <View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.lnLearnMoreLabel1}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.lnLearnMoreContent1}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.lnLearnMoreLabel2}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.lnLearnMoreContent2}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.lnLearnMoreLabel3}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.lnLearnMoreContent3}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.lnLearnMoreContent4}
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
export default LNLearnMore;
