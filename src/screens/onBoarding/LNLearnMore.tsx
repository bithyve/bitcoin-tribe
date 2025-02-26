import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LNLearnMoreIllustration from 'src/assets/images/lnLearnMoreIllustration.svg';
import LNLearnMoreIllustrationLight from 'src/assets/images/lnLearnMoreIllustration_light.svg';
import AppText from 'src/components/AppText';
import LearnMoreContentSection from './components/LearnMoreContentSection';
import { Keys } from 'src/storage';

function LNLearnMore() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.mainnetAndLightning} />
      <ScrollView style={styles.wrapper}>
        <View>
          <AppText variant="heading3" style={styles.titleText}>
            {onBoarding.lnLearnMoreSubtitle}
          </AppText>
        </View>
        <LearnMoreContentSection
          title={onBoarding.lnLearnMoreLabel1}
          subtitle={onBoarding.lnLearnMoreContent1}
          illustration={
            isThemeDark ? (
              <LNLearnMoreIllustration />
            ) : (
              <LNLearnMoreIllustrationLight />
            )
          }
        />
        <LearnMoreContentSection
          title={onBoarding.lnLearnMoreLabel2}
          subtitle={onBoarding.lnLearnMoreContent2}
        />
        <LearnMoreContentSection
          title={onBoarding.lnLearnMoreLabel3}
          subtitle={onBoarding.lnLearnMoreContent3}
        />
        <LearnMoreContentSection title={onBoarding.lnLearnMoreContent4} />
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
