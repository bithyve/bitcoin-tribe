import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useQuery } from '@realm/react';
import { Platform } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import BackupHistoryList from './components/BackupHistoryList';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import SettingIconLight from 'src/assets/images/icon_settings_light.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Buttons from 'src/components/Buttons';
import { wp } from 'src/constants/responsive';
import ModalContainer from 'src/components/ModalContainer';
import ConfirmAppBackup from './components/ConfirmAppBackup';
import { Keys } from 'src/storage';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMMKVBoolean } from 'react-native-mmkv';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { BackupType } from 'src/models/enums/Backup';
import Toast from 'src/components/Toast';

function WalletBackupHistory({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [words, setWords] = useState(app && app.primaryMnemonic.split(' '));
  const [visible, setVisible] = useState(false);
  const [backup, setBackup] = useMMKVBoolean(Keys.WALLET_BACKUP);

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.walletBackupHistory}
        subTitle={settings.walletBackupHistorySubTitle}
        rightIcon={isThemeDark ? <SettingIcon /> : <SettingIconLight />}
        onBackNavigation={() =>
          navigation.navigate(NavigationRoutes.APPBACKUPMENU)
        }
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.BACKUPPHRASESETTING)
        }
      />
      <BackupHistoryList />
      <Buttons
        primaryTitle={settings.healthCheck}
        primaryOnPress={() => setVisible(true)}
        width={wp(170)}
      />
      <ModalContainer
        title={settings.confirmBackupPhrase}
        subTitle={settings.confirmBackupPhraseSubtitle}
        visible={visible}
        enableCloseIcon={false}
        height={Platform.OS == 'ios' && '85%'}
        onDismiss={() => setVisible(false)}>
        <ConfirmAppBackup
          primaryOnPress={async () => {
            if (BackupType.SEED) {
              setVisible(false);
              const response = await ApiHandler.createBackup(true);
              if (response) {
                setBackup(true);
                setVisible(false);
                setTimeout(() => {
                  Toast(settings.SEED_BACKUP_CONFIRMED);
                }, 400);
                // navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY);
              }
            }
          }}
          secondaryOnPress={async () => {
            // setVisible(false);
            const response = await ApiHandler.createBackup(false);
            if (response) {
              setVisible(false);
              setTimeout(() => {
                Toast(settings.SEED_BACKUP_CONFIRMATION_SKIPPED);
              }, 400);
              // navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY);
            }
          }}
          words={words}
        />
      </ModalContainer>
    </ScreenContainer>
  );
}
export default WalletBackupHistory;
