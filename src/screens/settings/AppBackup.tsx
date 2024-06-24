import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import SeedCard from 'src/components/SeedCard';
const words = [
  'ketchup',
  'unique',
  'canvas',
  'benefit',
  'vacuum',
  'oyster',
  'omit',
  'hospital',
  'shiver',
  'hollow',
  'ridge',
  'october',
];

function AppBackup() {
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appBackup}
        subTitle={settings.appBackupScreenSubTitle}
        enableBack={true}
        rightIcon={<SettingIcon />}
      />
      <FlatList
        data={words}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <SeedCard item={item} index={index} />}
        keyExtractor={item => item}
      />
      <Buttons
        primaryTitle={common.next}
        primaryOnPress={() => console.log('primary')}
        secondaryTitle={common.exit}
        secondaryOnPress={() => console.log('secondary')}
        width={wp(120)}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default AppBackup;
