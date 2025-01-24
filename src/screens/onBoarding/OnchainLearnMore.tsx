import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import OnchainLearnMoreIllustration from 'src/assets/images/onchainLearnMoreIllustration.svg';
import AppText from 'src/components/AppText';

function OnchainLearnMore() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.mainnet} />
      <ScrollView style={styles.wrapper}>
        <View>
          <AppText variant="body1" style={styles.titleText}>
            {onBoarding.onChainLearnMoreSubTitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <OnchainLearnMoreIllustration />
        </View>
        <View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.onchainLearnMoreLabel1}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.onchainLearnMoreContent1}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.onchainLearnMoreLabel2}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.onchainLearnMoreContent2}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.onchainLearnMoreLabel3}
            </AppText>
            <AppText variant="body1" style={styles.subTitleText}>
              {onBoarding.onchainLearnMoreContent3}
            </AppText>
          </View>
          <View>
            <AppText variant="body1" style={styles.titleText}>
              {onBoarding.onchainLearnMoreContent4}
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
export default OnchainLearnMore;
