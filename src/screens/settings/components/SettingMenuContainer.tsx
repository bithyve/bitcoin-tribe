import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';
import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';

function SettingMenuContainer({}) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);

  return (
    <View style={styles.wrapper}>
      <SelectOption
        title={settings.darkMode}
        // subTitle={settings.darkModeSubTitle}
        icon={<IconDarkMode />}
        enableSwitch={true}
        onValueChange={() => {
          setDarkTheme(!darkTheme);
        }}
        toggleValue={!darkTheme}
        testID="dark_mode"
      />
      <SelectOption
        title={settings.biometricUnlock}
        // subTitle={settings.biometricSubTitle}
        icon={<IconBiometric />}
        enableSwitch={true}
        onValueChange={() => setBiometrics(!biometrics)}
        toggleValue={biometrics}
        testID="biometric_unlock"
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: windowHeight > 650 ? hp(30) : hp(20),
    },
  });
export default SettingMenuContainer;
