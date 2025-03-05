import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

interface SocialButtonProps {
  icon: ReactNode;
  title: string;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  title,
  onPress,
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>{icon}</View>
      <AppText variant="body2" style={styles.titleText}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      height: hp(48),
      width: '48%',
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    titleText: {
      color: theme.colors.headingColor,
    },
  });

export default SocialButton;
