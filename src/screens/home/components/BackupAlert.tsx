import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import BackupAlertIllustration from 'src/assets/images/backupAlertIllustration.svg';
import PrimaryCTA from 'src/components/PrimaryCTA';
import SecondaryCTA from 'src/components/SecondaryCTA';

type backAlertProps = {
  onSkipPress: () => void;
  onPrimaryPress: () => void;
};

function BackupAlert(props: backAlertProps) {
  const { onSkipPress, onPrimaryPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, home } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View>
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
        <SecondaryCTA
          onPress={onSkipPress}
          title={common.skip}
          width={hp(100)}
        />
        <PrimaryCTA
          title={common.backupNow}
          onPress={onPrimaryPress}
          width={hp(140)}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
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
      marginVertical: hp(20),
    },
    ctaWrapper: {
      flexDirection: 'row',
      marginTop: hp(15),
      marginRight: hp(10),
    },
  });
export default BackupAlert;
