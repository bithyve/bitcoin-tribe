import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import SocialButton from './SocialButton';
import TelegramIcon from 'src/assets/images/telegramIcon.svg';
import TelegramIconLight from 'src/assets/images/telegramIconLight.svg';
import TwitterIcon from 'src/assets/images/twitterIcon.svg';
import TwitterIconLight from 'src/assets/images/twitterIconLight.svg';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

interface SocialLinksProps {
  onPressTelegram: () => void;
  onPressX: () => void;
}

const SocialLinks = (props: SocialLinksProps) => {
  const { onPressTelegram, onPressX } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <View style={styles.container}>
      <SocialButton
        icon={isThemeDark ? <TelegramIcon /> : <TelegramIconLight />}
        title={settings.tribeTelegram}
        onPress={onPressTelegram}
      />
      <SocialButton
        icon={isThemeDark ? <TwitterIcon /> : <TwitterIconLight />}
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
