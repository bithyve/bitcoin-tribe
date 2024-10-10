import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import GoBack from 'src/assets/images/icon_back.svg';
import GoBackLight from 'src/assets/images/icon_back_light.svg';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import { AppTheme } from 'src/theme';
import IconWrapper from 'src/components/IconWrapper';
import { windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';

type ToolbarProps = {
  onPress: () => void;
  ticker: string;
};
function Toolbar(props: ToolbarProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { onPress } = props;
  return (
    <View style={styles.headerWrapper}>
      <IconWrapper onPress={navigation.goBack} style={styles.leftIconWrapper}>
        {!isThemeDark ? <GoBack /> : <GoBackLight />}
      </IconWrapper>
      <View style={styles.profileWrapper}>
        <AppText style={styles.text} variant="heading1">
          {props.ticker}
        </AppText>
      </View>
      <IconWrapper onPress={onPress} style={styles.rightIconWrapper}>
        <View style={styles.rightIconWrapper1}>{<SettingIcon />}</View>
      </IconWrapper>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftIconWrapper: {
      width: '20%',
    },
    profileWrapper: {
      width: '60%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: windowHeight > 650 ? 0 : 10,
    },
    rightIconWrapper: {
      width: '20%',
      alignItems: 'flex-end',
    },
    rightIconWrapper1: {
      borderRadius: 100,
    },
    text: {
      color: theme.colors.accent1,
      fontSize: 22,
    },
  });
export default Toolbar;
