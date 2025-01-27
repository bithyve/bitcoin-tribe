import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { useTheme } from 'react-native-paper';

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
}

const LearnMoreContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  illustration,
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View>
      {illustration && (
        <View style={styles.illustrationWrapper}>{illustration}</View>
      )}
      <View style={styles.contentWrapper}>
        <AppText variant="body1" style={styles.titleText}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="body1" style={styles.subTitleText}>
            {subtitle}
          </AppText>
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
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

export default LearnMoreContentSection;
