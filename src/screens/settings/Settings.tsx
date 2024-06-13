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
import { hp } from 'src/constants/responsive';

function SettingsScreen() {
  const theme = useTheme();
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
      <ScrollView>
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
const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      marginBottom: hp(20),
    },
  });
export default SettingsScreen;
