import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import HideAsseIcon from 'src/assets/images/hideAsset.svg';
import HideAssetIconLight from 'src/assets/images/hideAsset_light.svg';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';

type hideAssetViewProps = {
  title: string;
  onPress: () => void;
};

function HideAssetView(props: hideAssetViewProps) {
  const { title, onPress } = props;
  const { translations } = React.useContext(LocalizationContext);
  const { assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  return (
    <>
      <View style={styles.divider} />
      <View style={[styles.container]}>
        <AppTouchable onPress={onPress} style={styles.hideAssetTextWrapper}>
          <View>{isThemeDark ? <HideAsseIcon /> : <HideAssetIconLight />}</View>
          <AppText variant="body2" style={[styles.titleStyle]}>
            {title}
          </AppText>
        </AppTouchable>
      </View>
    </>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      marginTop: hp(20),
      marginBottom: hp(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    titleStyle: {
      color: theme.colors.headingColor,
      textDecorationLine: 'underline',
      marginLeft: hp(20),
    },
    hideAssetTextWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.separator,
      marginTop: hp(15),
    },
  });
export default HideAssetView;
