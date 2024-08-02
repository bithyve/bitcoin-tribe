import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, wp } from 'src/constants/responsive';
import TextField from 'src/components/TextField';
import { generateRandomNumber } from 'src/utils/encryption';
import { BackupType } from 'src/storage';
import AppText from 'src/components/AppText';
import Colors from 'src/theme/Colors';

type confirmAppBackupProps = {
  primaryOnPress: () => void;
  secondaryOnPress: () => void;
  words: string;
};
function ConfirmAppBackup(props: confirmAppBackupProps) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { primaryOnPress, secondaryOnPress, words } = props;
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const [seedWord, setSeedWord] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [index] = useState(generateRandomNumber(words.length));

  const getSeedNumber = seedNumber => {
    switch (seedNumber + 1) {
      case 1:
        return 'first (01)';
      case 2:
        return 'second (02)';
      case 3:
        return 'third (03)';
      case 4:
        return 'fourth (04)';
      case 5:
        return 'fifth (05)';
      case 6:
        return 'sixth (06)';
      case 7:
        return 'seventh (07)';
      case 8:
        return 'eighth (08)';
      case 9:
        return 'ninth (09)';
      case 10:
        return 'tenth (10)';
      case 11:
        return 'eleventh (11)';
      case 12:
        return 'twelfth (12)';
    }
  };

  const onPressConfirm = () => {
    if (BackupType.SEED) {
      if (seedWord.toLocaleLowerCase() === words[index]) {
        setInvalid(false);
        primaryOnPress();
      } else {
        setInvalid(true);
      }
    } else {
      setInvalid(true);
    }
  };

  return (
    <View>
      <TextField
        value={seedWord}
        onChangeText={text => setSeedWord(text?.toLocaleLowerCase())}
        placeholder={`Enter the ${getSeedNumber(index)} word`}
        keyboardType={'default'}
        autoFocus={true}
      />
      {invalid && (
        <AppText style={styles.invalidTextStyle}>Invalid word</AppText>
      )}
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.confirm}
          primaryOnPress={onPressConfirm}
          secondaryTitle={common.skip}
          secondaryOnPress={secondaryOnPress}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    buttonWrapper: {
      width: '100%',
      justifyContent: 'space-between',
      marginTop: hp(20),
    },
    invalidTextStyle: {
      color: Colors.ImperialRed,
      fontSize: 14,
      margin: hp(10),
    },
  });
export default ConfirmAppBackup;
