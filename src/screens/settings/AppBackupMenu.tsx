import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SettingMenuItem from './components/SettingMenuItem';
import { hp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import EnterPasscodeModal from 'src/components/EnterPasscodeModal';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import { AppContext } from 'src/contexts/AppContext';
import PinMethod from 'src/models/enums/PinMethod';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';

type AppBackupMenuProps = {
  title: string;
  onPress: () => void;
  hideMenu?: boolean;
};

function AppBackupMenu({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings, onBoarding } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [backup] = useMMKVBoolean(Keys.WALLET_BACKUP);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [visible, setVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [invalidPin, setInvalidPin] = useState('');
  const { setKey } = useContext(AppContext);
  const login = useMutation(ApiHandler.verifyPin);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const AppBackupMenu: AppBackupMenuProps[] = [
    {
      title: settings.walletBackup,
      onPress: () =>
        backup
          ? navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY)
          : pinMethod !== PinMethod.DEFAULT
          ? setVisible(true)
          : navigation.navigate(NavigationRoutes.APPBACKUP, {
              viewOnly: false,
            }),
      hideMenu: app.appType === AppType.NODE_CONNECT,
    },
    {
      title: settings.rgbAssetsbackup,
      onPress: () => navigation.navigate(NavigationRoutes.CLOUDBACKUP),
    },
    // Add more menu items as needed
  ];

  useEffect(() => {
    if (login.error) {
      setInvalidPin(onBoarding.invalidPin);
      setPasscode('');
    } else if (login.data) {
      setVisible(false);
      setPasscode('');
      setTimeout(() => {
        navigation.navigate(NavigationRoutes.APPBACKUP, {
          viewOnly: false,
        });
      }, 100);
    }
  }, [login.error, login.data]);

  const handlePasscodeChange = newPasscode => {
    setInvalidPin('');
    setPasscode(newPasscode); // Update state from child
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appBackup}
        subTitle={settings.appBackupMenuSubTitle}
        enableBack={true}
        style={styles.headerWrapper}
      />
      <SettingMenuItem SettingsMenu={AppBackupMenu} />
      <EnterPasscodeModal
        title={settings.EnterPasscode}
        subTitle={settings.EnterPasscodeSubTitle}
        visible={visible}
        passcode={passcode}
        invalidPin={invalidPin}
        onPasscodeChange={handlePasscodeChange}
        onDismiss={() => {
          setPasscode('');
          handlePasscodeChange('');
          setVisible(false);
        }}
        primaryOnPress={() => {
          setPasscode('');
          handlePasscodeChange('');
          login.mutate(passcode);
        }}
        isLoading={login.isLoading}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      marginBottom: hp(25),
    },
  });
export default AppBackupMenu;
