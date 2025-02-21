import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';

interface SkipButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
}

const SkipButton: React.FC<SkipButtonProps> = ({
  onPress,
  disabled = false,
  title,
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <AppTouchable disabled={disabled} onPress={onPress}>
      <AppText variant="body2" style={styles.skipText}>
        {title}
      </AppText>
    </AppTouchable>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    skipText: {
      color: theme.colors.secondaryHeadingColor,
      textDecorationLine: 'underline',
      alignSelf: 'center',
      marginVertical: hp(10),
    },
  });

export default SkipButton;
