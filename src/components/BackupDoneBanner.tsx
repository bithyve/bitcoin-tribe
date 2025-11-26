import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { hp, windowWidth } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';

const BackupDoneBanner = () => {
  const { isBackupDone } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return isBackupDone ? (
    <View style={styles.banner}>
      <Text style={styles.text}>{common.backDoneMsg}</Text>
    </View>
  ) : null;
};

const styles =
  StyleSheet.create({
    banner: {
      backgroundColor: Colors.GOGreen,
      alignItems: 'center',
      width:windowWidth,
      height:hp(25),
      justifyContent:"center"
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default BackupDoneBanner;
