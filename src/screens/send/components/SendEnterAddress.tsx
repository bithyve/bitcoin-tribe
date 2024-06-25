import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

import { AppTheme } from 'src/theme';

function SendEnterAddress() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [address, setAddress] = useState('');
  return (
    <View style={styles.container}>
      <TextField
        value={address}
        onChangeText={text => setAddress(text)}
        placeholder={sendScreen.enterAddress}
        keyboardType={'default'}
      />
      <View style={styles.primaryCTAContainer}>
        <Buttons
          primaryTitle={common.save}
          secondaryTitle={common.cancel}
          primaryOnPress={() => console.log('press')}
          secondaryOnPress={() => console.log('press')}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    primaryCTAContainer: {
      marginTop: hp(65),
    },
    container: {
      width: '100%',
      marginTop: hp(45),
    },
  });
export default SendEnterAddress;
