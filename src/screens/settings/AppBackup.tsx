import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { useQuery } from '@realm/react';
import { useRoute } from '@react-navigation/native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import { wp } from 'src/constants/responsive';
import SeedCard from 'src/components/SeedCard';
import ModalContainer from 'src/components/ModalContainer';
import ConfirmAppBackup from './components/ConfirmAppBackup';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { Keys } from 'src/storage';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMMKVBoolean } from 'react-native-mmkv';
import { BackupType } from 'src/models/enums/Backup';

function AppBackup({ navigation }) {
  const { viewOnly } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const [words, setWords] = useState(app && app.primaryMnemonic.split(' '));
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [backup, setBackup] = useMMKVBoolean(Keys.WALLET_BACKUP);

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.walletBackup}
        subTitle={settings.appBackupScreenSubTitle}
        enableBack={true}
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
      {!viewOnly && (
        <Buttons
          primaryTitle={common.next}
          primaryOnPress={() => setVisible(true)}
          secondaryTitle={common.exit}
          secondaryOnPress={() => navigation.goBack()}
          width={wp(120)}
        />
      )}
      <ModalContainer
        title={settings.confirmBackupPhrase}
        subTitle={settings.confirmBackupPhraseSubtitle}
        visible={visible}
        height={Platform.OS == 'ios' && '80%'}
        onDismiss={() => setVisible(false)}>
        <ConfirmAppBackup
          primaryOnPress={async () => {
            if (BackupType.SEED) {
              setVisible(false);
              const response = await ApiHandler.createBackup(true);
              if (response) {
                setBackup(true);
                navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY);
              }
            }
          }}
          secondaryOnPress={async () => {
            setVisible(false);
            const response = await ApiHandler.createBackup(false);
            if (response) {
              navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY);
            }
          }}
          words={words}
        />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default AppBackup;
