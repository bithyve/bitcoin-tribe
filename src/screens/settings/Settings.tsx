import React, { useState, useContext } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import IconBackup from 'src/assets/images/icon_backup.svg';
import IconLangCurrency from 'src/assets/images/icon_globe.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconNodes from 'src/assets/images/icon_node.svg';

function SettingsScreen() {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const [darkTheme, setDarkTheme] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader title={settings.setting} enableBack={false} />
      <View style={styles.wrapper}>
        <SelectOption
          title={settings.darkMode}
          subTitle={settings.darkModeSubTitle}
          icon={<IconDarkMode />}
          enableSwitch={true}
          onValueChange={() => setDarkTheme(!darkTheme)}
          toggleValue={darkTheme}
          testID="dark_mode"
        />
        <SelectOption
          title={settings.biometricUnlock}
          subTitle={settings.biometricSubTitle}
          icon={<IconBiometric />}
          enableSwitch={true}
          onValueChange={() => setBiometrics(!biometrics)}
          toggleValue={biometrics}
          testID="biometric_unlock"
        />
      </View>
      <ScrollView
        style={styles.scrollingWrapper}
        showsVerticalScrollIndicator={false}>
        <SelectOption
          title={settings.langAndCurrency}
          subTitle={settings.langAndCurrencySubTitle}
          icon={<IconLangCurrency />}
          onPress={() => console.log('press')}
          testID="language_and_currency"
        />
        <SelectOption
          title={settings.appBackup}
          subTitle={settings.appBackupSubTitle}
          icon={<IconBackup />}
          onPress={() => console.log('press')}
          testID="app_backup"
        />
        <SelectOption
          title={settings.connectionSettings}
          subTitle={settings.connectionSettingSubTitle}
          icon={<IconNodes />}
          onPress={() => console.log('press')}
          testID="connection_settings"
        />
        <SelectOption
          title={settings.appInfo}
          subTitle={settings.appInfoSubTitle}
          icon={<IconAppInfo />}
          onPress={() => console.log('press')}
          testID="app_info"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: windowHeight > 600 ? hp(30) : hp(15),
    },
    scrollingWrapper: {
      flex: 1,
    },
  });
export default SettingsScreen;
