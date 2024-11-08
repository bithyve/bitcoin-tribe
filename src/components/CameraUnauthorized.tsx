import React, { useContext } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, wp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import PrimaryCTA from './PrimaryCTA';

function CameraUnauthorized() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);

  const requestPermission = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('src/assets/images/cameraAuthFailed.png')}
          style={styles.imageStyle}
        />
      </View>
      <AppText variant="heading3" style={styles.titleText}>
        {common.cameraPermissionTitle}
      </AppText>
      <PrimaryCTA
        title={common.cameraPermissionCTA}
        onPress={requestPermission}
        width={hp(170)}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: wp(8),
    },
    titleText: {
      color: theme.colors.headingColor,
      lineHeight: 20,
      marginTop: hp(10),
      marginBottom: hp(20),
    },
    imageStyle: {
      height: wp(250),
      width: wp(250),
      marginBottom: hp(5),
    },
  });
export default CameraUnauthorized;
