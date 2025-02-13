import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import SocialButton from './SocialButton';
import TelegramIcon from 'src/assets/images/telegramIcon.svg';
import TwitterIcon from 'src/assets/images/twitterIcon.svg';
import { AppTheme } from 'src/theme';
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
      width: '100%',
    },
  });

export default SocialLinks;
