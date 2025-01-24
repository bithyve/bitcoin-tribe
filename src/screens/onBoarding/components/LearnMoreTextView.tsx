import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type LearnMoreTextViewProps = {
  title: string;
  onPress: () => void;
};

function LearnMoreTextView(props: LearnMoreTextViewProps) {
  const { title, onPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.learnMoreWrapper1}>
      <Text style={styles.learnMoreTitleText}>
        {title}&nbsp;
        <Text style={styles.learnMoreText} onPress={onPress}>
          {onBoarding.learnMore}
        </Text>
      </Text>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    learnMoreWrapper1: {
      width: '90%',
      flexDirection: 'row',
      marginVertical: hp(5),
    },
    learnMoreTitleText: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.secondaryHeadingColor,
    },
    learnMoreText: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.accent1,
      textDecorationLine: 'underline',
    },
  });
export default LearnMoreTextView;
