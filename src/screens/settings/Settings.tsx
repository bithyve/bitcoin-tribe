import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { StyleSheet, View } from 'react-native';
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
import ResetWalletIconLight from 'src/assets/images/ic_reset_wallet_light.svg';
import ResetWalletIcon from 'src/assets/images/ic_reset_wallet.svg';
import SyncWalletIcon from 'src/assets/images/ic_sync_wallet.svg';
import SyncWalletIconLight from 'src/assets/images/ic_sync_wallet_light.svg';
import WalletResetWarning from 'src/assets/images/wallet_reset_warning.svg';
import IconViewNodeInfo from 'src/assets/images/viewNodeInfo.svg';
import IconNodeInfoLight from 'src/assets/images/viewNodeInfo_light.svg';
import ResetWallet from 'src/assets/images/reset_wallet.svg';
import ResetWalletLight from 'src/assets/images/reset_wallet_light.svg';
import ResettingWallet from 'src/assets/images/resetting_wallet.svg';
import ResettingWalletLight from 'src/assets/images/resetting_wallet_light.svg';
import WalletSync from 'src/assets/images/wallet_sync.svg';
import WalletSyncLight from 'src/assets/images/wallet_sync_light.svg';
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
import { hp, windowWidth } from 'src/constants/responsive';
import EnterPasscodeModal from 'src/components/EnterPasscodeModal';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { SettingMenuProps } from 'src/models/interfaces/Settings';
import BiometricUnlockModal from './components/BiometricUnlockModal';
import HomeHeader from '../home/components/HomeHeader';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import LottieView from 'lottie-react-native';
import RGBServices from 'src/services/rgb/RGBServices';
import useRgbWallets from 'src/hooks/useRgbWallets';
import dbManager from 'src/storage/realm/dbManager';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';

const RNBiometrics = new ReactNativeBiometrics();

function SettingsScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const {
    settings,
    onBoarding,
    wallet: walletTranslation,
    common,
    resetWalletMessages,
  } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { manualAssetBackupStatus, hasCompletedManualBackup, reSyncWallet } =
    useContext(AppContext);
  const [darkTheme, setDarkTheme] = useMMKVBoolean(Keys.THEME_MODE);
  const [biometrics, setBiometrics] = useState(false);
  const [isEnableBiometrics, setIsEnableBiometrics] = useState(false);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [visible, setVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [invalidPin, setInvalidPin] = useState('');
  const [visibleBiometricUnlock, setVisibleBiometricUnlock] = useState(false);
  const login = useMutation(ApiHandler.verifyPin);
  const [showResetWalletModal, setShowResetWalletModal] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [resetTextInput, setResetTextInput] = useState('');
  const [resetWalletFinalConfirmation, setResetWalletFinalConfirmation] =
    useState(false);
  const [resettingWallet, setResettingWallet] = useState(false);
  const { wallets } = useRgbWallets({});
  const rgbWallet = useMemo(() => wallets[0], [wallets]);
  const [showFullSyncModal, setShowFullSyncModal] = useState(false);

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
      setVisibleBiometricUnlock(true);
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

  const resetWallet = async () => {
    setResetWalletFinalConfirmation(false);
    setTimeout(async () => {
      setResettingWallet(true);
      try {
        const response = await RGBServices.resetWallet(
          rgbWallet.masterFingerprint,
        );
        if (response && response.status) {
          dbManager.clearSchemas([
            RealmSchema.RgbWallet,
            RealmSchema.Coin,
            RealmSchema.Collectible,
            RealmSchema.UniqueDigitalAsset,
          ]);
          const rgbWallet: RGBWallet = await RGBServices.restoreKeys(
            app.primaryMnemonic,
          );
          dbManager.createObject(RealmSchema.RgbWallet, rgbWallet);
          const isWalletOnline = await RGBServices.initiate(
            rgbWallet.mnemonic,
            rgbWallet.accountXpubVanilla,
            rgbWallet.accountXpubColored,
            rgbWallet.masterFingerprint,
          );
          if (isWalletOnline && isWalletOnline.status) {
            await ApiHandler.refreshRgbWallet();
            Toast(resetWalletMessages.WalletResetSuccessfully, false);
            setResettingWallet(false);
          }
        } else {
          Toast(
            response.error || resetWalletMessages.FailedToResetWallet,
            true,
          );
          setResettingWallet(false);
        }
      } catch (error) {
        console.log(error);
        setResettingWallet(false);
        Toast(error.message, true);
      }
    }, 400);
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
      hideMenu: app?.appType === AppType.ON_CHAIN,
    },
    {
      id: 3,
      title: settings.channelManagement,
      icon: isThemeDark ? <IconChannelMgt /> : <IconChannelMgtLight />,
      onPress: () => navigation.navigate(NavigationRoutes.RGBCHANNELS),
      hideMenu: app?.appType === AppType.ON_CHAIN,
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
      hideMenu:
        app?.appType === AppType.NODE_CONNECT ||
        app?.primaryMnemonic === app?.id,
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

  const AdvancedMenu: SettingMenuProps[] = [
    {
      id: 1,
      title: resetWalletMessages.ResyncWalletData,
      icon: isThemeDark ? <SyncWalletIcon /> : <SyncWalletIconLight />,
      onPress: () => setShowFullSyncModal(true),
    },
    {
      id: 2,
      title: resetWalletMessages.ResetYourWallet,
      icon: isThemeDark ? <ResetWalletIcon /> : <ResetWalletIconLight />,
      onPress: () => setShowResetWalletModal(true),
    },
  ];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showSearch />
      </View>
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
          AdvancedMenu={AdvancedMenu}
        />
      </View>
      <View>
        <BiometricUnlockModal
          visible={visibleBiometricUnlock}
          primaryCtaTitle={'Set Passcode'}
          primaryOnPress={() => {
            setVisibleBiometricUnlock(false);
            setIsEnableBiometrics(true);
            navigation.navigate(NavigationRoutes.CREATEPIN, {
              biometricProcess: true,
            });
          }}
        />
      </View>

      <ResponsePopupContainer
        visible={showFullSyncModal}
        onDismiss={() => setShowFullSyncModal(false)}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}>
        <View style={styles.infoWrapper}>
          <AppText variant="heading2" style={styles.headerText}>
            Your wallet will now perform a full resync.
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            This may take a few minutes depending on your data size and network
            speed.
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            Please do not minimize or close the app until the process is
            complete.
          </AppText>
        </View>
        {isThemeDark ? <WalletSync /> : <WalletSyncLight />}
        <View style={styles.ctaWrapper}>
          <Buttons
            primaryTitle={'Start Resync'}
            primaryOnPress={() => {
              reSyncWallet(true);
              setShowFullSyncModal(false);
            }}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => {
              setShowFullSyncModal(false);
            }}
            width={windowWidth / 2.6}
            secondaryCTAWidth={windowWidth / 3}
            height={hp(14)}
          />
        </View>
      </ResponsePopupContainer>

      <ResponsePopupContainer
        visible={showResetWalletModal}
        onDismiss={() => setShowResetWalletModal(false)}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}>
        <View style={styles.infoWrapper}>
          <AppText variant="heading2" style={styles.headerText}>
            {resetWalletMessages.Aresure}
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            {resetWalletMessages.clearCurrentWalletSetup}
          </AppText>
        </View>
        <WalletResetWarning />
        <View style={styles.ctaWrapper}>
          <Buttons
            primaryTitle={resetWalletMessages.yesReset}
            primaryOnPress={() => {
              setShowResetWalletModal(false);
              setTimeout(() => {
                setShowConfirmResetModal(true);
              }, 400);
            }}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => setShowResetWalletModal(false)}
            width={windowWidth / 2.6}
            secondaryCTAWidth={windowWidth / 3}
            height={hp(14)}
          />
        </View>
      </ResponsePopupContainer>

      <ResponsePopupContainer
        visible={showConfirmResetModal}
        onDismiss={() => {
          setShowConfirmResetModal(false);
          setResetTextInput('');
        }}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}>
        <View style={styles.infoWrapper}>
          <AppText variant="heading2" style={styles.headerText}>
            {resetWalletMessages.confirmReset}
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            {resetWalletMessages.clearCurrentWalletState}
          </AppText>
          <AppText style={styles.textTypeReset}>
            {resetWalletMessages.pleaseTypeReset}
          </AppText>
        </View>

        <TextField
          value={resetTextInput}
          onChangeText={text => setResetTextInput(text)}
          placeholder={resetWalletMessages.userMustEnterReset}
          style={styles.input}
          inputStyle={styles.inputStyle}
        />
        <View style={styles.ctaWrapper}>
          <Buttons
            primaryTitle={resetWalletMessages.confirmResetButton}
            disabled={resetTextInput !== 'RESET'}
            primaryOnPress={() => {
              setShowConfirmResetModal(false);
              setResetTextInput('');
              setTimeout(() => {
                setResetWalletFinalConfirmation(true);
              }, 400);
            }}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => setShowConfirmResetModal(false)}
            width={windowWidth / 2.6}
            secondaryCTAWidth={windowWidth / 3}
            height={hp(14)}
          />
        </View>
      </ResponsePopupContainer>

      <ResponsePopupContainer
        visible={resetWalletFinalConfirmation}
        onDismiss={() => setResetWalletFinalConfirmation(false)}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}>
        <View style={styles.infoWrapper}>
          <AppText variant="heading2" style={styles.headerText}>
            {resetWalletMessages.ResetYourWallet}
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            {resetWalletMessages.rgbWalletCorrupted}
          </AppText>
        </View>
        {isThemeDark ? <ResetWallet /> : <ResetWalletLight />}

        <View style={styles.containerResetTexts}>
          <AppText style={styles.textResetTexts}>
            {resetWalletMessages.clearRgbAssetData}
          </AppText>
          <AppText style={styles.textResetTexts}>
            {resetWalletMessages.btcBalanceNotAffected}
          </AppText>
          <AppText style={styles.textResetTexts}>
            {resetWalletMessages.rgbAssetsNoLongerAccessible}
          </AppText>
          <AppText style={styles.textResetTexts}>
            {resetWalletMessages.proceedWithReset}
          </AppText>
        </View>

        <View style={styles.ctaWrapper}>
          <Buttons
            primaryTitle={resetWalletMessages.resetNow}
            primaryOnPress={resetWallet}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => setResetWalletFinalConfirmation(false)}
            width={windowWidth / 2.6}
            secondaryCTAWidth={windowWidth / 3}
            height={hp(14)}
          />
        </View>
      </ResponsePopupContainer>

      <ResponsePopupContainer
        visible={resettingWallet}
        onDismiss={() => {}}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}>
        <View style={styles.infoWrapper}>
          <AppText variant="heading2" style={styles.headerText}>
            {resetWalletMessages.resettingYourWallet}
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            {resetWalletMessages.pleaseWaitReset}
          </AppText>
        </View>
        {isThemeDark ? <ResettingWallet /> : <ResettingWalletLight />}

        <View style={styles.loaderWrapper}>
          <AppText style={styles.loaderMsgText}>
            {resetWalletMessages.fewSecondsStep}
          </AppText>
          <View style={styles.dotLoaderWrapper}>
            <LottieView
              source={
                isThemeDark
                  ? require('src/assets/images/jsons/dotsLoader.json')
                  : require('src/assets/images/jsons/dotsLoader_light.json')
              }
              style={styles.dotLoaderStyle}
              autoPlay
              loop
            />
          </View>
        </View>
      </ResponsePopupContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 0,
    },
    headerWrapper: {
      marginVertical: hp(16),
    },
    infoWrapper: {
      marginTop: hp(10),
    },
    headerText: {
      color: theme.colors.headingColor,
      marginBottom: hp(5),
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(10),
    },
    ctaWrapper: {
      alignSelf: 'center',
      marginTop: hp(30),
    },
    textTypeReset: {
      marginBottom: hp(10),
      marginTop: hp(20),
      textAlign: 'left',
    },
    input: {},
    inputStyle: {
      marginBottom: hp(10),
    },
    containerResetTexts: {
      marginTop: hp(10),
    },
    textResetTexts: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    dotLoaderWrapper: {
      flex: 1,
    },
    loaderMsgText: {
      color: theme.colors.headingColor,
      flex: 2.5,
    },
    loaderStyle: {
      alignSelf: 'center',
    },
    loaderWrapper: {
      flexDirection: 'row',
      height: hp(90),
      justifyContent: 'space-between',
      marginTop: hp(5),
      alignItems: 'center',
    },
    dotLoaderStyle: {
      alignSelf: 'center',
      width: hp(120),
      height: hp(120),
    },
  });
export default SettingsScreen;
