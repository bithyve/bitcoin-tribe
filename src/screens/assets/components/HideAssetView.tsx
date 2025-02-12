import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type hideAssetViewProps = {
  title: string;
  onPress: () => void;
};
function HideAssetView(props: hideAssetViewProps) {
  const { title, onPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const styles = getStyles(theme);
  return (
    <AppTouchable onPress={onPress} style={styles.container}>
      <AppText variant="body2" style={[styles.titleStyle]}>
        {title}
      </AppText>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      marginTop: hp(20),
    },
    titleStyle: {
      color: theme.colors.headingColor,
      textDecorationLine: 'underline',
    },
  });
export default HideAssetView;
