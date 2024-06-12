import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import GoBack from 'src/assets/images/icon_back.svg';
import AppTouchable from './AppTouchable';
import { useNavigation } from '@react-navigation/native';

type AppHeaderProps = {
  title?: string;
  subTitle?: string;
  style?: StyleProp<ViewStyle>;
  enableBack?: boolean;
  rightIcon?: React.ReactNode;
};

function AppHeader(props: AppHeaderProps) {
  const { title, subTitle, style, enableBack = true, rightIcon } = props;
  const theme = useTheme();
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
            onPress={navigation.goBack}
            style={styles.rightIconWrapper}>
            {rightIcon}
          </AppTouchable>
        )}
      </View>
      {title || subTitle ? (
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
      ) : null}
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: hp(15),
      alignItems: 'center',
    },
    iconContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftIconWrapper: {
      borderRadius: 100,
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
