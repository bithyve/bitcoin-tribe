import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
import { useQuery } from '@realm/react';
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVString,
} from 'react-native-mmkv';
import { useMutation } from 'react-query';
import Share from 'react-native-share';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { hp } from 'src/constants/responsive';
import { Keys, Storage } from 'src/storage';
import EnterPasscodeModal from 'src/components/EnterPasscodeModal';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import PinMethod from 'src/models/enums/PinMethod';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import RGBServices from 'src/services/rgb/RGBServices';
import ModalLoading from 'src/components/ModalLoading';
import SelectOption from 'src/components/SelectOption';
import AppText from 'src/components/AppText';
import moment from 'moment';
import Relay from 'src/services/relay';

function AppBackupMenu({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings, onBoarding } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [backup] = useMMKVBoolean(Keys.WALLET_BACKUP);
  const [lastRelayBackup] = useMMKVNumber(Keys.RGB_ASSET_RELAY_BACKUP);
  const [assetBackup, setAssetBackup] = useMMKVBoolean(Keys.ASSET_BACKUP);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [visible, setVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [invalidPin, setInvalidPin] = useState('');
  const { setKey } = useContext(AppContext);
  const login = useMutation(ApiHandler.verifyPin);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [isLoading, setIsLoading] = useState(false);

  const rgbAssetsbackup = async () => {
    try {
      setIsLoading(true);
      const backup = await RGBServices.backup('', app.primaryMnemonic);
      setIsLoading(false);
      if (backup.file) {
        setTimeout(async () => {
          const shareResult = await Share.open({
            url: Platform.select({
              android: `file://${backup.file}`,
              ios: backup.file,
            }),
            title: 'RGB Asset Backup File',
          });
          if (shareResult.success) {
            setAssetBackup(true);
          }
          const response = await Relay.rgbFileBackup(
            Platform.select({
              android: `file://${backup.file}`,
              ios: backup.file,
            }),
            app.id,
            '',
          );
          if (response.uploaded) {
            Storage.set(Keys.RGB_ASSET_RELAY_BACKUP, Date.now());
          }
        }, 1000);
      }
    } catch (error) {
      console.log('error', error);
      setIsLoading(false);
    }
  };

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
    setPasscode(newPasscode);
  };

  const subtitle = useMemo(() => {
    if (backup && !assetBackup) {
      return settings.walletBackupDone;
    } else if (assetBackup && !backup) {
      return (
        `${Platform.select({
          ios: 'iCloud',
          android: 'Google Drive',
        })}` +
        ' ' +
        settings.assetBackupDone
      );
    } else if (backup && assetBackup) {
      return settings.walletAssetBackupDone;
    } else {
      return app.appType === AppType.ON_CHAIN
        ? settings.appBackupMenuSubTitle
        : settings.nodeAppBackupMenuSubTitle;
    }
  }, [backup, app.appType, assetBackup]);

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.appBackup}
        subTitle={subtitle}
        enableBack={true}
        style={styles.headerWrapper}
      />

      {app.primaryMnemonic !== '' && (
        <View style={styles.itemContainer}>
          <AppText style={styles.textStep} variant="body1">
            {settings.step1}
          </AppText>
          <SelectOption
            title={settings.walletBackup}
            subTitle={''}
            onPress={() =>
              backup
                ? navigation.navigate(NavigationRoutes.WALLETBACKUPHISTORY)
                : pinMethod !== PinMethod.DEFAULT
                ? setVisible(true)
                : navigation.navigate(NavigationRoutes.APPBACKUP, {
                    viewOnly: false,
                  })
            }
            backup={backup}
          />
          <AppText variant="caption" style={styles.textSubtext}>
            {settings.walletBackupInfo}
          </AppText>
        </View>
      )}

      {app.appType === AppType.ON_CHAIN && (
        <View style={styles.itemContainer}>
          <AppText style={styles.textStep} variant="body1">
            {settings.step2}
          </AppText>
          <SelectOption
            title={settings.rgbAssetsbackup}
            subTitle={''}
            onPress={rgbAssetsbackup}
            backup={assetBackup}
          />
          <AppText style={styles.textStepTime}>
            {`${settings.relayBackupTime} ${moment(lastRelayBackup).format(
            'DD MMM YY  •  hh:mm a',
          )}`}</AppText>
          <AppText variant="caption" style={styles.textSubtext}>
            {settings.assetBackupInfo1}
          </AppText>
          <AppText variant="caption" style={styles.textSubtext}>
            {settings.assetBackupInfo2}
          </AppText>
          <AppText variant="caption" style={styles.textSubtext}>
            {settings.assetBackupInfo3}
          </AppText>
          <AppText variant="caption" style={styles.textSubtext}>
            {settings.assetBackupInfo4}
          </AppText>
        </View>
      )}
      <ModalLoading visible={isLoading} />
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
    itemContainer: {
      marginVertical: hp(10),
    },
    textStep: {
      color: theme.colors.accent4,
      textAlign: 'left',
      lineHeight: 30,
      marginLeft: hp(10),
    },
    textSubtext: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'justify',
      marginTop: hp(5),
      marginHorizontal: hp(15),
    },
    textStepTime: {
      color: theme.colors.greenText,
      marginHorizontal: hp(15),
      marginBottom: hp(5),
    },
  });
export default AppBackupMenu;
