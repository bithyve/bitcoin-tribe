import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import Buttons from 'src/components/Buttons';
import { wp } from 'src/constants/responsive';
import SeedCard from 'src/components/SeedCard';
import ModalContainer from 'src/components/ModalContainer';
import ConfirmAppBackup from './components/ConfirmAppBackup';
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

function AppBackup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const [visible, setVisible] = useState(false);

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
        primaryOnPress={() => setVisible(true)}
        secondaryTitle={common.exit}
        secondaryOnPress={() => navigation.goBack()}
        width={wp(120)}
      />
      <ModalContainer
        title={settings.confirmBackupPhrase}
        subTitle={settings.confirmBackupPhraseSubtitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <ConfirmAppBackup
          primaryOnPress={() => console.log('')}
          secondaryOnPress={() => console.log('')}
        />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default AppBackup;
