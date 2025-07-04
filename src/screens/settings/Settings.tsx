import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import IconBackup from 'src/assets/images/icon_backup.svg';
import IconBackupLight from 'src/assets/images/icon_backup_light.svg';
import IconLangCurrency from 'src/assets/images/icon_globe1.svg';
import IconLangCurrencyLight from 'src/assets/images/icon_lang_light.svg';
import IconAppInfo from 'src/assets/images/icon_info.svg';
import IconAppInfoLight from 'src/assets/images/icon_info_light.svg';
import SetPasscode from 'src/assets/images/setPasscode.svg';
import SetPasscodeLight from 'src/assets/images/setPasscode_light.svg';
import IconBiometric from 'src/assets/images/icon_fingerprint.svg';
import IconBiometricLight from 'src/assets/images/icon_fingerprint_light.svg';
import IconDarkMode from 'src/assets/images/icon_moon.svg';
import IconDarkModeLight from 'src/assets/images/icon_moon_light.svg';
import IconWalletSettings from 'src/assets/images/icon_wallet.svg';
import IconWalletSettingsLight from 'src/assets/images/icon_wallet_light.svg';
import IconNamePic from 'src/assets/images/icon_namePic.svg';
import IconNamePicLight from 'src/assets/images/icon_namePic_light.svg';
import IconChannelMgt from 'src/assets/images/channelMgt.svg';
import IconChannelMgtLight from 'src/assets/images/channelMgt_light.svg';
import HiddenAssetIcon from 'src/assets/images/hiddenAsset.svg';
import HiddenAssetIconLight from 'src/assets/images/hiddenAsset_light.svg';
import IconViewNodeInfo from 'src/assets/images/viewNodeInfo.svg';
import IconNodeInfoLight from 'src/assets/images/viewNodeInfo_light.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SettingMenuItem from './components/SettingMenuItem';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import Toast from 'src/components/Toast';
import * as SecureStore from 'src/storage/secure-store';
import { AppContext } from 'src/contexts/AppContext';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { hp } from 'src/constants/responsive';
import EnterPasscodeModal from 'src/components/EnterPasscodeModal';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { SettingMenuProps } from 'src/models/interfaces/Settings';

const RNBiometrics = new ReactNativeBiometrics();

function SettingsScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings, onBoarding, wallet: walletTranslation } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { manualAssetBackupStatus, hasCompletedManualBackup } =
    useContext(AppContext);
  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);
  const [isEnableBiometrics, setIsEnableBiometrics] = useState(false);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const { key } = useContext(AppContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [visible, setVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [invalidPin, setInvalidPin] = useState('');
  const login = useMutation(ApiHandler.verifyPin);

  useEffect(() => {
    if (pinMethod === PinMethod.BIOMETRIC) {
      setBiometrics(true);
    } else if (pinMethod === PinMethod.DEFAULT) {
      setBiometrics(false);
    }
  }, [pinMethod]);

  const enableBiometrics = async () => {
    try {
      const { available } = await RNBiometrics.isSensorAvailable();
      if (available) {
        const { keysExist } = await RNBiometrics.biometricKeysExist();
        if (keysExist) {
          await RNBiometrics.createKeys();
        }
        const { publicKey } = await RNBiometrics.createKeys();
        const { success } = await RNBiometrics.simplePrompt({
          promptMessage: 'Confirm your identity',
        });
        if (success) {
          await SecureStore.storeBiometricPubKey(publicKey);
          Storage.set(Keys.PIN_METHOD, PinMethod.BIOMETRIC);
        }
      } else {
        Toast(settings.biometricsNotEnableMsg, true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isEnableBiometrics && pinMethod === PinMethod.PIN) {
      enableBiometrics();
    }
  }, [isEnableBiometrics, pinMethod]);

  useEffect(() => {
    if (login.error) {
      setInvalidPin(onBoarding.invalidPin);
      setPasscode('');
    } else if (login.data) {
      setVisible(false);
      setPasscode('');
      setTimeout(() => {
        navigation.navigate(NavigationRoutes.CHANGEPIN);
      }, 100);
    }
  }, [login.error, login.data]);

  const toggleBiometrics = useCallback(() => {
    if (pinMethod === PinMethod.DEFAULT) {
      setIsEnableBiometrics(true);
      navigation.navigate(NavigationRoutes.CREATEPIN, {
        biometricProcess: true,
      });
    } else if (pinMethod === PinMethod.PIN) {
      enableBiometrics();
    } else if (pinMethod === PinMethod.BIOMETRIC) {
      // resetPinMethod will be used in future - need ux or something else
      // ApiHandler.resetPinMethod(key);
      Storage.set(Keys.PIN_METHOD, PinMethod.PIN);
      setBiometrics(false);
    }
  }, [pinMethod, navigation, enableBiometrics]);

  const handlePasscodeChange = newPasscode => {
    setInvalidPin('');
    setPasscode(newPasscode);
  };

  const WalletMgtMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: walletTranslation.xpubAndUtxoTitle,
      icon: isThemeDark ? <IconWalletSettings /> : <IconWalletSettingsLight />,
      onPress: () => navigation.navigate(NavigationRoutes.WALLETSETTINGS),
    },
    {
      id: 2,
      title: settings.viewNodeInfo,
      icon: isThemeDark ? <IconViewNodeInfo /> : <IconNodeInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.VIEWNODEINFO),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
    {
      id: 3,
      title: settings.channelManagement,
      icon: isThemeDark ? <IconChannelMgt /> : <IconChannelMgtLight />,
      onPress: () => navigation.navigate(NavigationRoutes.RGBCHANNELS),
      hideMenu: app.appType === AppType.ON_CHAIN,
    },
    {
      id: 4,
      title: settings.hiddenAssets,
      icon: isThemeDark ? <HiddenAssetIcon /> : <HiddenAssetIconLight />,
      onPress: () => navigation.navigate(NavigationRoutes.HIDDENASSETS),
    },
  ];
  const PersonalizationMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: walletTranslation.nameAndPic,
      icon: isThemeDark ? <IconNamePic /> : <IconNamePicLight />,
      onPress: () => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE),
    },
    {
      id: 2,
      title: settings.langAndCurrency,
      icon: isThemeDark ? <IconLangCurrency /> : <IconLangCurrencyLight />,
      onPress: () => navigation.navigate(NavigationRoutes.LANGUAGEANDCURRENCY),
    },
    {
      id: 3,
      title: settings.darkMode,
      icon: isThemeDark ? <IconDarkMode /> : <IconDarkModeLight />,
      onValueChange: () => {
        setDarkTheme(!darkTheme);
      },
      toggleValue: darkTheme,
      enableSwitch: true,
      testID: 'dark_mode',
      onPress: () => setDarkTheme(!darkTheme),
    },
  ];
  const AppSecurityMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: settings.setPasscodeTitle,
      icon: isThemeDark ? <SetPasscode /> : <SetPasscodeLight />,
      onPress: () =>
        navigation.navigate(NavigationRoutes.CREATEPIN, {
          biometricProcess: false,
        }),
      hideMenu: pinMethod !== PinMethod.DEFAULT,
      manualAssetBackupStatus: false,
      hasCompletedManualBackup: false,
    },
    {
      id: 2,
      title: 'Change Passcode',
      icon: isThemeDark ? <SetPasscode /> : <SetPasscodeLight />,
      onPress: () => setVisible(true),
      hideMenu: pinMethod === PinMethod.DEFAULT,
      manualAssetBackupStatus: false,
      hasCompletedManualBackup: false,
    },
    {
      id: 3,
      title: settings.appBackup,
      icon: isThemeDark ? <IconBackup /> : <IconBackupLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPBACKUPMENU),
      manualAssetBackupStatus: manualAssetBackupStatus,
      hasCompletedManualBackup: hasCompletedManualBackup,
    },
    {
      id: 4,
      title: settings.biometricUnlock,
      icon: isThemeDark ? <IconBiometric /> : <IconBiometricLight />,
      onValueChange: toggleBiometrics,
      toggleValue: biometrics,
      enableSwitch: true,
      testID: 'biometric_unlock',
      onPress: toggleBiometrics,
    },
  ];

  const SettingsMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: settings.appInfo,
      icon: isThemeDark ? <IconAppInfo /> : <IconAppInfoLight />,
      onPress: () => navigation.navigate(NavigationRoutes.APPINFO),
    },
    // TO DO - will implement node setting functionality. This commented temporarily
    // {
    //   id: 2,
    //   title: settings.nodeSettings,
    //   icon: isThemeDark ? <IconNodes /> : <IconNodesLight/>,
    //   onPress: () => navigation.navigate(NavigationRoutes.NODESETTINGS),
    // },
  ];

  return (
    <ScreenContainer>
      <EnterPasscodeModal
        title={'Change Passcode'}
        subTitle={'Enter your current passcode'}
        visible={visible}
        passcode={passcode}
        invalidPin={invalidPin}
        onPasscodeChange={handlePasscodeChange}
        onDismiss={() => {
          setPasscode('');
          handlePasscodeChange('');
          setVisible(false);
          login.reset();
        }}
        primaryOnPress={() => {
          setPasscode('');
          handlePasscodeChange('');
          login.mutate(passcode);
        }}
        isLoading={login.isLoading}
      />
      <View style={styles.container}>
        <SettingMenuItem
          WalletMgtMenu={WalletMgtMenu}
          PersonalizationMenu={PersonalizationMenu}
          AppSecurityMenu={AppSecurityMenu}
          SettingsMenu={SettingsMenu}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: Platform.OS === 'ios' ? hp(20) : hp(30),
    },
  });
export default SettingsScreen;
