import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import TextField from 'src/components/TextField';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';

function ConnectNodeManuallyContainer() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;

  const [nodeName, setNodeName] = useState('');
  const [nodeCredential, setNodeCredential] = useState('');
  const [nodeAddress, setNodeAddress] = useState('');

  return (
    <KeyboardAvoidView style={styles.container}>
      <View style={styles.inputsContainer}>
        <View style={styles.inputWrapper}>
          <TextField
            value={nodeName}
            onChangeText={text => setNodeName(text)}
            placeholder={settings.enterNodeName}
            keyboardType={'default'}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextField
            value={nodeCredential}
            onChangeText={text => setNodeCredential(text)}
            placeholder={settings.enterCredentials}
            keyboardType={'default'}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextField
            value={nodeAddress}
            onChangeText={text => setNodeAddress(text)}
            placeholder={settings.enterAddress}
            keyboardType={'default'}
          />
        </View>
      </View>
      <Buttons
        primaryTitle={common.next}
        primaryOnPress={() => console.log('primary')}
        secondaryTitle={common.cancel}
        secondaryOnPress={() => console.log('secondary')}
        width={wp(120)}
      />
    </KeyboardAvoidView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    inputsContainer: {
      marginTop: hp(30),
      marginBottom: hp(50),
    },
    inputWrapper: {
      marginVertical: hp(10),
    },
  });
export default ConnectNodeManuallyContainer;