import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import GoBack from 'src/assets/images/icon_back.svg';
import GoBackLight from 'src/assets/images/icon_back_light.svg';
import AppTouchable from './AppTouchable';
import { Route, useNavigation } from '@react-navigation/native';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type AppHeaderProps = {
  title?: string;
  subTitle?: string;
  style?: StyleProp<ViewStyle>;
  enableBack?: boolean;
  rightIcon?: React.ReactNode;
  onSettingsPress?: () => void;
  onBackNavigation?;
  rightText?: string;
  onRightTextPress?: () => void;
};

function AppHeader(props: AppHeaderProps) {
  const {
    title,
    subTitle,
    style,
    enableBack = true,
    onBackNavigation,
    rightIcon,
    rightText,
    onRightTextPress,
    onSettingsPress,
  } = props;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(
    () => getStyles(theme, enableBack),
    [theme, enableBack],
  );
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {enableBack && (
          <View style={styles.leftIconWrapper}>
            <AppTouchable
              onPress={onBackNavigation ? onBackNavigation : navigation.goBack}>
              {isThemeDark ? <GoBack /> : <GoBackLight />}
            </AppTouchable>
          </View>
        )}
        <View style={styles.middleTitleWrapper}>
          {title && (
            <AppText variant="heading3" style={styles.headerTitle}>
              {title}
            </AppText>
          )}
        </View>
        <View style={styles.rightIconWrapper}>
          {rightIcon && (
            <AppTouchable
              onPress={onSettingsPress}
              style={styles.rightIconWrapper}>
              {rightIcon}
            </AppTouchable>
          )}
          {rightText && (
            <AppTouchable onPress={onRightTextPress}>
              <AppText variant="heading2" style={styles.rightTextStyle}>
                {rightText}
              </AppText>
            </AppTouchable>
          )}
        </View>
      </View>
      {subTitle ? (
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText variant="heading3" style={styles.headerSubTitle}>
              {subTitle}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
const getStyles = (theme: AppTheme, enableBack: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginTop: Platform.OS === 'android' ? hp(20) : 0,
      alignItems: 'center',
    },
    iconContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp(15),
      marginBottom: hp(20),
    },
    leftIconWrapper: {
      width: '15%',
      alignItems: 'center',
    },
    middleTitleWrapper: {
      width: '65%',
      alignItems: 'center',
      marginLeft: 0,
    },
    rightIconWrapper: {
      width: '20%',
      alignItems: 'center',
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '100%',
      marginTop: hp(4),
    },
    headerTitle: {
      color: theme.colors.headingColor,
    },
    headerSubTitle: {
      color: theme.colors.secondaryHeadingColor,
    },
    addNewWrapper: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addNewText: {
      color: theme.colors.accent1,
    },
    rightTextStyle: {
      color: theme.colors.accent1,
    },
  });
export default AppHeader;
