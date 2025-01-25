import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import OnchainLearnMoreIllustration from 'src/assets/images/onchainLearnMoreIllustration.svg';
import OnchainLearnMoreIllustrationLight from 'src/assets/images/onchainLearnMoreIllustration_light.svg';
import AppText from 'src/components/AppText';
import { Keys } from 'src/storage';
import LearnMoreContentSection from './components/learnMoreContentSection';

function OnchainLearnMore() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.mainnet} />
      <ScrollView style={styles.wrapper}>
        <View>
          <AppText variant="body1" style={styles.titleText}>
            {onBoarding.onChainLearnMoreSubTitle}
          </AppText>
        </View>
        <LearnMoreContentSection
          title={onBoarding.onchainLearnMoreLabel1}
          subtitle={onBoarding.onchainLearnMoreContent1}
          illustration={
            isThemeDark ? (
              <OnchainLearnMoreIllustration />
            ) : (
              <OnchainLearnMoreIllustrationLight />
            )
          }
        />
        <LearnMoreContentSection
          title={onBoarding.onchainLearnMoreLabel2}
          subtitle={onBoarding.onchainLearnMoreContent2}
        />
        <LearnMoreContentSection
          title={onBoarding.onchainLearnMoreLabel3}
          subtitle={onBoarding.onchainLearnMoreContent3}
        />
        <LearnMoreContentSection title={onBoarding.onchainLearnMoreContent4} />
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {},
    titleText: {
      color: theme.colors.headingColor,
      marginBottom: hp(3),
    },
  });
export default OnchainLearnMore;
