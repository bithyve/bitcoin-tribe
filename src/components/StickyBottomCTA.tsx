import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';

type StickyBottomCTAProps = {
  onPressSend: () => void;
  sendDisabled?: boolean;
  sendLabel?: string;
};

const StickyBottomCTA = ({
  onPressSend,
  sendDisabled = false,
  sendLabel,
}: StickyBottomCTAProps) => {
  const theme: AppTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const label = sendLabel ?? common?.send ?? 'Send';
  const styles = getStyles(theme, insets);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <AppTouchable
        style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
        onPress={onPressSend}
        disabled={sendDisabled}>
        <AppText variant="body1Bold" style={styles.sendLabel}>
          {label}
        </AppText>
      </AppTouchable>
    </View>
  );
};

const getStyles = (theme: AppTheme, insets: { bottom: number }) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: insets.bottom + hp(10),
      left: wp(16),
      right: wp(16),
      zIndex: 1000,
    },
    sendButton: {
      backgroundColor: theme.colors.primaryCTA,
      borderRadius: hp(28),
      paddingVertical: hp(14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    sendLabel: {
      color: theme.colors.primaryCTAText,
    },
  });

export default StickyBottomCTA;
