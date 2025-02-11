import React, { useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import SocialButton from './SocialButton';
import TelegramIcon from 'src/assets/images/telegramIcon.svg';
import TwitterIcon from 'src/assets/images/twitterIcon.svg';
import { AppTheme } from 'src/theme';
import { windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

interface SocialLinksProps {
  onPressTelegram: () => void;
  onPressX: () => void;
}

const SocialLinks = (props: SocialLinksProps) => {
  const { onPressTelegram, onPressX } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  console.log('windowHeight', windowHeight);
  return (
    <View style={styles.container}>
      <SocialButton
        icon={<TelegramIcon />}
        title={settings.tribeTelegram}
        onPress={onPressTelegram}
      />
      <SocialButton
        icon={<TwitterIcon />}
        title={settings.tribeX}
        onPress={onPressX}
      />
    </View>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      bottom:
        Platform.OS === 'android'
          ? windowHeight > 670
            ? '25%'
            : '28%'
          : windowHeight > 670
          ? '18%'
          : '22%',
    },
  });

export default SocialLinks;
