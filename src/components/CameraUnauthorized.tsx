import React, { useContext } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
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
      <AppText variant="body1" style={styles.titleText}>
        {common.cameraPermissionTitle}
      </AppText>
      <AppText variant="caption" style={styles.subTitleText}>
        {common.cameraPermissionSubTitle}
      </AppText>
      <PrimaryCTA
        title={common.cameraPermissionCTA}
        onPress={requestPermission}
        width={hp(250)}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: wp(340),
      width: wp(330),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: wp(50),
      borderRadius: wp(8),
      overflow: 'hidden',
    },
    titleText: {
      color: theme.colors.headingColor,
      lineHeight: 20,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      lineHeight: 20,
      marginBottom: hp(20),
    },
  });
export default CameraUnauthorized;
