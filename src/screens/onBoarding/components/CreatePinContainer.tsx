import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import PinInputsView from 'src/components/PinInputsView';
import { hp, wp } from 'src/constants/responsive';
import KeyPadView from 'src/components/KeyPadView';
import DeleteIcon from 'src/assets/images/delete.svg';
import DeleteIconLight from 'src/assets/images/delete_light.svg';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import RememberPasscode from './RememberPasscode';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

function CreatePinContainer() {
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [visible, setVisible] = useState(false);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const createPin = useMutation(ApiHandler.createPin);

  useEffect(() => {
    if (createPin.error) {
      Toast(onBoarding.errorSettingPin, true);
    } else if (createPin.isSuccess) {
      setVisible(true);
    }
  }, [createPin.error, createPin.isSuccess, createPin.data]);

  const disbleProceed = useMemo(() => {
    if (passcode === '' || confirmPasscode === '') {
      return true;
    } else {
      return passcode !== confirmPasscode;
    }
  }, [passcode, confirmPasscode]);

  useEffect(() => {
    if (passcode !== confirmPasscode && confirmPasscode.length === 4) {
      Toast(onBoarding.mismatchPasscode, true);
    }
  }, [passcode !== confirmPasscode && confirmPasscode]);

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    let tmpConfirmPasscode = confirmPasscode;
    if (passcodeFlag) {
      if (passcode.length < 4) {
        if (text !== 'x') {
          tmpPasscode += text;
          setPasscode(tmpPasscode);
        }
      } else if (passcode.length === 4 && passcodeFlag) {
        setPasscodeFlag(false);
        setConfirmPasscodeFlag(1);
        setPasscode(passcode);
      }
      if (passcode && text === 'x') {
        const passcodeTemp = passcode.slice(0, -1);
        setPasscode(passcodeTemp);
        if (passcodeTemp.length === 0) {
          setConfirmPasscodeFlag(0);
        }
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4) {
        if (text !== 'x') {
          tmpConfirmPasscode += text;
          setConfirmPasscode(tmpConfirmPasscode);
        }
      }
      if (confirmPasscode && text === 'x') {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      } else if (!confirmPasscode && text === 'x') {
        setPasscodeFlag(true);
        setConfirmPasscodeFlag(0);
        setConfirmPasscode(confirmPasscode);
      }
    }
  }

  const onDeletePressed = text => {
    if (passcodeFlag) {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, confirmPasscode.length - 1));
    }
  };

  useEffect(() => {
    if (
      confirmPasscode.length <= 4 &&
      confirmPasscode.length > 0 &&
      passcode.length === 4
    ) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length === 4 && confirmPasscodeFlag !== 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4 &&
      confirmPasscodeFlag === 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  return (
    <>
      <View style={styles.contentContainer}>
        <PinInputsView passCode={passcode} showCursor={true} />
        <AppText variant="heading3" style={styles.labelText}>
          {onBoarding.confirmPin}
        </AppText>
        <PinInputsView
          passCode={confirmPasscode}
          showCursor={passcode.length === 4}
        />
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => createPin.mutate(passcode)}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={disbleProceed}
          width={wp(120)}
        />
      </View>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={theme.colors.accent1}
        ClearIcon={isThemeDark ? <DeleteIcon /> : <DeleteIconLight />}
      />
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          onDismiss={() => setVisible(false)}
          width={'100%'}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <RememberPasscode
            title={onBoarding.rememberPasscodeTitle}
            subTitle={onBoarding.rememberPasscodeSubTitle}
            description={onBoarding.rememberPasscodeDesc}
            onPress={() => {
              setVisible(false);
              // Toast(onBoarding.newPinCreated);
              navigation.goBack();
            }}
          />
        </ResponsePopupContainer>
      </View>
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
export default CreatePinContainer;
