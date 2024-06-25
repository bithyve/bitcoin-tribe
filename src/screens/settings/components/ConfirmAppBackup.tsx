import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, wp } from 'src/constants/responsive';
import TextField from 'src/components/TextField';
import AppText from 'src/components/AppText';

type confirmAppBackupProps = {
  primaryOnPress: () => void;
  secondaryOnPress: () => void;
};
function ConfirmAppBackup(props: confirmAppBackupProps) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { primaryOnPress, secondaryOnPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const [address, setAddress] = useState('');
  return (
    <View>
      <AppText variant="body1" style={styles.labelStyle}>
        {settings.enterSeedWordLabel}
      </AppText>
      <TextField
        value={address}
        onChangeText={text => setAddress(text)}
        placeholder={settings.enterSeedWord}
        keyboardType={'default'}
      />
      <Buttons
        primaryTitle={common.next}
        primaryOnPress={primaryOnPress}
        secondaryTitle={common.cancel}
        secondaryOnPress={secondaryOnPress}
        width={wp(120)}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    labelStyle: {
      margin: hp(15),
      color: theme.colors.bodyColor,
    },
  });
export default ConfirmAppBackup;
