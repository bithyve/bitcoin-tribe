import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';

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
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';

// const words = [
//   'ketchup',
//   'unique',
//   'canvas',
//   'benefit',
//   'vacuum',
//   'oyster',
//   'omit',
//   'hospital',
//   'shiver',
//   'hollow',
//   'ridge',
//   'october',
// ];

function AppBackup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const wallet: Wallet = useQuery(RealmSchema.Wallet)[0];
  const [words, setWords] = useState(
    wallet &&
      wallet.derivationDetails &&
      wallet.derivationDetails.mnemonic.split(' '),
  );
  console.log('wallet', words);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {}, []);

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
        renderItem={({ item, index }) => (
          <SeedCard
            item={item}
            index={index}
            callback={(index, item) => {
              setActiveIndex(index);
            }}
            visible={index === activeIndex}
          />
        )}
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
          secondaryOnPress={() => setVisible(false)}
        />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default AppBackup;
