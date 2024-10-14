import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, Platform } from 'react-native';
import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import PinInputsView from 'src/components/PinInputsView';
import { hp, wp } from 'src/constants/responsive';
import KeyPadView from 'src/components/KeyPadView';
import DeleteIcon from 'src/assets/images/delete.svg';
import DeleteIconLight from 'src/assets/images/delete_light.svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import ModalLoading from 'src/components/ModalLoading';

const RNBiometrics = new ReactNativeBiometrics();

function EnterPinContainer() {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [passcode, setPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const login = useMutation(ApiHandler.loginWithPin);
  const biometricLogin = useMutation(ApiHandler.biometricLogin);
  const { setKey, setIsWalletOnline } = useContext(AppContext);
  const [pinMethod] = useMMKVString(Keys.PIN_METHOD);
  const [appId] = useMMKVString(Keys.APPID);
  const [loading, setLoading] = useState(false);
  const [primaryCTALoading, setPrimaryCTALoading] = useState(false);

  useEffect(() => {
    biometricAuth();
  }, []);

  useEffect(() => {
    if (biometricLogin.error) {
      setLoading(false);
      Toast(onBoarding.failToVerify, true);
      setPasscode('');
    } else if (biometricLogin.data) {
      setLoading(false);
      setKey(biometricLogin.data.key);
      setIsWalletOnline(biometricLogin.data.isWalletOnline);
      setTimeout(
        () => {
          navigation.replace(NavigationRoutes.APPSTACK);
        },
        Platform.OS === 'ios' ? 400 : 100,
      );
    }
  }, [biometricLogin.error, biometricLogin.data]);

  useEffect(() => {
    if (login.error) {
      setPrimaryCTALoading(false);
      setPasscode('');
      Toast(onBoarding.invalidPin, true);
    } else if (login.data) {
      setPrimaryCTALoading(false);
      setKey(login.data.key);
      setIsWalletOnline(login.data.isWalletOnline);
      navigation.replace(NavigationRoutes.APPSTACK);
    }
  }, [login.error, login.data]);

  const biometricAuth = async () => {
    if (pinMethod === PinMethod.BIOMETRIC) {
      try {
        setTimeout(async () => {
          const { success, signature } = await RNBiometrics.createSignature({
            promptMessage: 'Authenticate',
            payload: appId,
            cancelButtonText: 'Use PIN',
          });
          if (success) {
            setLoading(true);
            biometricLogin.mutate(signature);
          }
        }, 200);
      } catch (error) {
        //
        console.log(error);
      }
    }
  };

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    if (passcode.length < 4) {
      if (text !== 'x') {
        tmpPasscode += text;
        setPasscode(tmpPasscode);
      }
    } else if (passcode.length === 4 && passcodeFlag) {
      setPasscodeFlag(false);
      setPasscode(passcode);
    }
    if (passcode && text === 'x') {
      const passcodeTemp = passcode.slice(0, -1);
      setPasscode(passcodeTemp);
    }
  }

  const onDeletePressed = text => {
    setPasscode(passcode.slice(0, -1));
  };

  return (
    <>
      <View style={styles.contentContainer}>
        <PinInputsView passCode={passcode} showCursor={true} />
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => {
            setPrimaryCTALoading(true);
            login.mutate(passcode);
          }}
          // secondaryTitle={common.cancel}
          // secondaryOnPress={() => navigation.goBack()}
          disabled={
            passcode === '' ||
            passcode.length !== 4 ||
            login.isLoading ||
            primaryCTALoading
          }
          width={wp(120)}
          primaryLoading={login.isLoading || primaryCTALoading}
        />
      </View>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={theme.colors.accent1}
        ClearIcon={!isThemeDark ? <DeleteIcon /> : <DeleteIconLight />}
      />
      <ModalLoading visible={loading} />
    </>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
    },
    ctaWrapper: {
      marginVertical: hp(10),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(15),
    },
  });
export default EnterPinContainer;
