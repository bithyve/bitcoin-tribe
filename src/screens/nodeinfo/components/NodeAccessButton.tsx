import React from 'react';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppTouchable from 'src/components/AppTouchable';
import UnlockIcon from 'src/assets/images/unlockIcon.svg';
import LockIcon from 'src/assets/images/lightIcon.svg';
import LockIconLight from 'src/assets/images/lockIcon_light.svg';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import Colors from 'src/theme/Colors';

type NodeAccessButtonProps = {
  locked: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

const NodeAccessButton: React.FC<NodeAccessButtonProps> = ({
  locked,
  disabled = false,
  loading = false,
  onPress,
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const buttonText = locked ? 'Unlock' : 'Lock';
  const isPrimary = locked;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <AppTouchable
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonInactive,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          <Text
            style={[
              styles.text,
              isPrimary ? styles.textPrimary : styles.textInactive,
            ]}>
            {buttonText}
          </Text>
          <View style={styles.icon}>
            {!locked ? (
              isThemeDark ? (
                <LockIcon />
              ) : (
                <LockIconLight />
              )
            ) : (
              <UnlockIcon />
            )}
          </View>
        </View>
      )}
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      borderRadius: 15,
      height: 60,
      marginLeft: 5,
    },
    buttonPrimary: {
      backgroundColor: theme.colors.unlockCtaBackColor,
    },
    buttonInactive: {
      backgroundColor: Colors.CharlestonGreen,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
    },
    textPrimary: {
      color: Colors.White,
    },
    textInactive: {
      color: Colors.SpanishGray,
    },
    icon: {
      marginLeft: 5,
    },
  });
export default NodeAccessButton;
