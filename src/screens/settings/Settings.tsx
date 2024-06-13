import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';

import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import IconBackup from 'src/assets/images/icon_backup.svg';
import IconLangCurrency from 'src/assets/images/icon_globe.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconNodes from 'src/assets/images/icon_node.svg';
import { hp, windowHeight } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

function SettingsScreen() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const [darkTheme, setDarkTheme] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader title="Settings" enableBack={false} />
      <View style={styles.wrapper}>
        <SelectOption
          title="Dark Mode"
          subTitle="Switch between modes"
          icon={<IconDarkMode />}
          enableSwitch={true}
          onValueChange={() => setDarkTheme(!darkTheme)}
          toggleValue={darkTheme}
        />
        <SelectOption
          title="Biometric Unlock"
          subTitle="Use biometrics to unlock app"
          icon={<IconBiometric />}
          enableSwitch={true}
          onValueChange={() => setBiometrics(!biometrics)}
          toggleValue={biometrics}
        />
      </View>
      <ScrollView
        style={styles.scrollingWrapper}
        showsVerticalScrollIndicator={false}>
        <SelectOption
          title="Language and Currency"
          subTitle="Lorem ipsum dolor sit amet, consec "
          icon={<IconLangCurrency />}
          onPress={() => console.log('press')}
        />
        <SelectOption
          title="App Backup"
          subTitle="Lorem ipsum dolor sit amet, consec "
          icon={<IconBackup />}
          onPress={() => console.log('press')}
        />
        <SelectOption
          title="Connection Settings"
          subTitle="Lorem ipsum dolor sit amet, consec "
          icon={<IconNodes />}
          onPress={() => console.log('press')}
        />
        <SelectOption
          title="App Info , Settings and Help"
          subTitle="App version and details"
          icon={<IconAppInfo />}
          onPress={() => console.log('press')}
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
