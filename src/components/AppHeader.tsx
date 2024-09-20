import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import GoBack from 'src/assets/images/icon_back.svg';
import AppTouchable from './AppTouchable';
import { Route, useNavigation } from '@react-navigation/native';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

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
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {enableBack && (
          <AppTouchable
            onPress={onBackNavigation ? onBackNavigation : navigation.goBack}
            style={styles.leftIconWrapper}>
            {<GoBack />}
          </AppTouchable>
        )}
        {rightIcon && (
          <AppTouchable
            onPress={onSettingsPress}
            style={styles.rightIconWrapper}>
            {rightIcon}
          </AppTouchable>
        )}
        {rightText && (
          <AppTouchable
            onPress={onRightTextPress}
            style={styles.rightIconWrapper}>
            <AppText variant="heading2" style={styles.rightTextStyle}>
              {rightText}
            </AppText>
          </AppTouchable>
        )}
      </View>
      {title || subTitle ? (
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText variant="heading1" style={styles.headerTitle}>
              {title}
            </AppText>
            <AppText variant="heading3" style={styles.headerSubTitle}>
              {subTitle}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: hp(15),
      marginTop: Platform.OS === 'android' ? hp(15) : 0,
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
    leftIconWrapper: {},
    rightIconWrapper: {},
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
