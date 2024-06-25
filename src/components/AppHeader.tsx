import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import GoBack from 'src/assets/images/icon_back.svg';
import AppTouchable from './AppTouchable';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from 'src/theme';

type AppHeaderProps = {
  title?: string;
  subTitle?: string;
  style?: StyleProp<ViewStyle>;
  enableBack?: boolean;
  rightIcon?: React.ReactNode;
  onSettingsPress?: () => void;
};

function AppHeader(props: AppHeaderProps) {
  const {
    title,
    subTitle,
    style,
    enableBack = true,
    rightIcon,
    onSettingsPress,
  } = props;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {enableBack && (
          <AppTouchable
            onPress={navigation.goBack}
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
      </View>
      {title || subTitle ? (
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText variant="pageTitle" style={styles.headerTitle}>
              {title}
            </AppText>
            <AppText variant="body1" style={styles.headerSubTitle}>
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
      // marginTop: hp(10),
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
      borderRadius: 100,
      shadowColor: theme.colors.shodowColor,
      shadowRadius: 10,
      shadowOpacity: 0.8,
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },
    rightIconWrapper: {
      alignSelf: 'flex-end',
      borderRadius: 100,
      shadowColor: theme.colors.shodowColor,
      shadowRadius: 10,
      shadowOpacity: 0.8,
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
      marginTop: hp(4),
    },
    headerTitle: {
      color: theme.colors.headingColor,
    },
    headerSubTitle: {
      color: theme.colors.bodyColor,
    },
  });
export default AppHeader;
