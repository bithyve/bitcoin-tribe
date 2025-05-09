import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import VerticalGradientView from 'src/components/VerticalGradientView';
import InfoIcon from 'src/assets/images/infoIcon1.svg';
import InfoIconLight from 'src/assets/images/infoIcon1_light.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { Keys } from 'src/storage';
import { hp } from 'src/constants/responsive';

interface VerificationSectionProps {
  children: React.ReactNode;
}

function VerificationSection(props: VerificationSectionProps) {
  const { children } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  return (
    <VerticalGradientView
      colors={[
        theme.colors.cardGradient4,
        theme.colors.cardGradient5,
        theme.colors.cardGradient5,
      ]}
      style={styles.gradientContainer}>
      <View style={styles.verifyViewWrapper}>
        <View style={styles.verifyTitleWrapper}>
          <AppText variant="body2" style={styles.verifyTitle}>
            {assets.verificationTitle}
          </AppText>
        </View>
        <View>
          {isThemeDark ? (
            <InfoIcon width={24} height={24} />
          ) : (
            <InfoIconLight width={24} height={24} />
          )}
        </View>
      </View>
      {children}
    </VerticalGradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    gradientContainer: {
      marginTop: hp(20),
      paddingHorizontal: hp(16),
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
    },
    verifyViewWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(20),
      alignItems: 'center',
    },
    verifyTitleWrapper: {
      width: '90%',
    },
    verifyTitle: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default VerificationSection;
