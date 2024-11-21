import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import BackupAlertIllustration from 'src/assets/images/backupAlertIllustration.svg';
import Buttons from 'src/components/Buttons';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';


function BackupOnboardingScreen() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, home } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <View style={styles.contentWrapper1}>
        <AppText variant="heading1" style={styles.titleText}>
          {home.backupAlertTitle}
        </AppText>
        <AppText variant="heading3" style={styles.subTitleText}>
          {home.backupAlertSubTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>
        <BackupAlertIllustration />
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.next}
          primaryOnPress={() => {
            navigation.replace(NavigationRoutes.APPSTACK);
          }}
          disabled={false}
          width={wp(130)}
        />
      </View>
    
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentWrapper1: {
      marginVertical: hp(20),
      paddingTop: hp(20),
      height: '30%',
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      marginVertical: hp(10),
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: '50%',
    },
    ctaWrapper: {
      height: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
export default BackupOnboardingScreen;
