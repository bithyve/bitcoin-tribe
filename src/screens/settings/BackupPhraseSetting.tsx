import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import AppHeader from 'src/components/AppHeader';
import EnterPasscodeModal from 'src/components/EnterPasscodeModal';

import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import PinMethod from 'src/models/enums/PinMethod';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

function BackupPhraseSetting() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { settings, onBoarding } = translations;
  const navigation = useNavigation();
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [visible, setVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [invalidPin, setInvalidPin] = useState('');
  const login = useMutation(ApiHandler.verifyPin);

  useEffect(() => {
    if (login.error) {
      setInvalidPin(onBoarding.invalidPin);
      setPasscode('');
    } else if (login.data) {
      setVisible(false);
      setPasscode('');
      setTimeout(() => {
        navigation.navigate(NavigationRoutes.APPBACKUP, {
          viewOnly: true,
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
        title={settings.backupPhraseSettingTitle}
        subTitle={settings.backupPhraseSettingSubTitle}
      />
      <SelectOption
        title={settings.viewBackupPhrase}
        subTitle={settings.viewBackupPhraseSubTitle}
        onPress={
          () => {
            pinMethod !== PinMethod.DEFAULT
              ? setVisible(true)
              : navigation.navigate(NavigationRoutes.APPBACKUP, {
                  viewOnly: true,
                });
          }
          // navigation.navigate(NavigationRoutes.APPBACKUP, {
          //   viewOnly: true,
          // })
        }
      />
      <EnterPasscodeModal
        title={settings.EnterPasscode}
        subTitle={settings.EnterPasscodeSubTitle}
        visible={visible}
        passcode={passcode}
        onPasscodeChange={handlePasscodeChange}
        invalidPin={invalidPin}
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
export default BackupPhraseSetting;
