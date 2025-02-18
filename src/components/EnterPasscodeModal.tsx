import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';

import { hp, windowWidth, wp } from 'src/constants/responsive';
import Buttons from './Buttons';
import ModalContainer from './ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import PinInputsView from './PinInputsView';
import KeyPadView from './KeyPadView';
import { AppTheme } from 'src/theme';
import DeleteIcon from 'src/assets/images/delete.svg';
import DeleteIconLight from 'src/assets/images/delete_light.svg';
import AppText from './AppText';
import Colors from 'src/theme/Colors';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';

interface Props {
  title: string;
  subTitle: string;
  visible: boolean;
  isLoading?: boolean;
  primaryOnPress: () => void;
  passcode: string;
  onPasscodeChange;
  onDismiss?: () => void;
  invalidPin?: string;
}

const EnterPasscodeModal: React.FC<Props> = ({
  title,
  subTitle,
  visible,
  primaryOnPress,
  isLoading,
  onPasscodeChange,
  passcode,
  onDismiss,
  invalidPin,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [passcodeFlag, setPasscodeFlag] = useState(true);

  const handleInputChange = value => {
    // Update local state in the child
    onPasscodeChange(value); // Call the parent function to update state
  };

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    if (passcode.length < 4) {
      if (text !== 'x') {
        tmpPasscode += text;
        handleInputChange(tmpPasscode);
      }
    } else if (passcode.length === 4 && passcodeFlag) {
      setPasscodeFlag(false);
      handleInputChange(passcode);
    }
    if (passcode && text === 'x') {
      const passcodeTemp = passcode.slice(0, -1);
      handleInputChange(passcodeTemp);
    }
  }

  const onDeletePressed = text => {
    handleInputChange(passcode.slice(0, -1));
  };
  return (
    <ModalContainer
      title={title}
      subTitle={subTitle}
      visible={visible}
      enableCloseIcon={false}
      onDismiss={onDismiss}>
      <View style={styles.contentContainer}>
        <PinInputsView passCode={passcode} showCursor={true} />
      </View>
      {invalidPin && (
        <View>
          <AppText variant="caption" style={styles.invalidPinMsgStyle}>
            {invalidPin}
          </AppText>
        </View>
      )}
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={primaryOnPress}
          secondaryTitle={common.cancel}
          secondaryOnPress={onDismiss}
          disabled={passcode === '' || passcode.length !== 4 || isLoading}
          width={windowWidth / 2.4}
          secondaryCTAWidth={windowWidth / 2.4}
          primaryLoading={isLoading}
        />
      </View>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={theme.colors.accent1}
        ClearIcon={isThemeDark ? <DeleteIcon /> : <DeleteIconLight />}
      />
    </ModalContainer>
  );
};
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
    invalidPinMsgStyle: {
      color: Colors.ImperialRed,
      margin: hp(10),
    },
  });
export default EnterPasscodeModal;
