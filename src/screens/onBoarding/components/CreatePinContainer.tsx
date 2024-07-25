import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import PinInputsView from 'src/components/PinInputsView';
import { hp, wp } from 'src/constants/responsive';
import KeyPadView from 'src/components/KeyPadView';
import DeleteIcon from 'src/assets/images/delete.svg';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function CreatePinContainer() {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);

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
      <Buttons
        primaryTitle={common.proceed}
        primaryOnPress={() => console.log('primary')}
        secondaryTitle={common.cancel}
        secondaryOnPress={() => console.log('secondary')}
        width={wp(120)}
      />
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={theme.colors.primaryCTA}
        ClearIcon={<DeleteIcon />}
      />
    </>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
    },
    container: {
      width: '100%',
      marginTop: hp(15),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(15),
    },
  });
export default CreatePinContainer;
