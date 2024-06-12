import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import IconArrow from 'src/assets/images/icon_back.svg';
import AppTouchable from './AppTouchable';

type AppHeaderProps = {
  title?: string;
  subTitle?: string;
  style?: any;
  navigation?: any;
  rightIcon?: any;
};

function AppHeader(props: AppHeaderProps) {
  const { title, subTitle, style, navigation, rightIcon } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {navigation && (
          <AppTouchable
            onPress={() => navigation.goBack()}
            style={styles.leftIconWrapper}>
            <IconArrow />
          </AppTouchable>
        )}
        {rightIcon && (
          <AppTouchable
            onPress={() => navigation.goBack()}
            style={styles.rightIconWrapper}>
            {rightIcon}
          </AppTouchable>
        )}
      </View>
      <View style={styles.detailsWrapper}>
        <View style={styles.contentWrapper}>
          <AppText
            variant="pageTitle"
            style={styles.headerTitle}
            testID="text_appHeader">
            {title}
          </AppText>
          <AppText style={styles.headerSubTitle} testID="text_appSubHeader">
            {subTitle}
          </AppText>
        </View>
      </View>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: hp(10),
    },
    iconContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftIconWrapper: {
      width: '50%',
      alignItems: 'flex-start',
    },
    rightIconWrapper: {
      width: '50%',
      alignItems: 'flex-end',
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
      marginTop: hp(10),
    },
    headerTitle: {
      color: theme.colors.headingColor,
    },
    headerSubTitle: {
      color: theme.colors.bodyColor,
    },
  });
export default AppHeader;
