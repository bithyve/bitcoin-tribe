import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import GoBack from 'src/assets/images/icon_back.svg';
import AppTouchable from './AppTouchable';
import { useNavigation } from '@react-navigation/native';

type AppHeaderProps = {
  title?: string;
  subTitle?: string;
  style?: any;
  enableBack?: boolean;
  rightIcon?: any;
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
          <AppTouchable onPress={navigation.goBack} style={styles.back}>
            {<GoBack />}
          </AppTouchable>
        )}
        {rightIcon && (
          <AppTouchable onPress={navigation.goBack}>{rightIcon}</AppTouchable>
        )}
      </View>
      <View style={styles.detailsWrapper}>
        <View style={styles.contentWrapper}>
          <AppText variant="pageTitle" style={styles.headerTitle}>
            {title}
          </AppText>
          <AppText style={styles.headerSubTitle}>{subTitle}</AppText>
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
    back: {
      borderRadius: 100,
    },
  });
export default AppHeader;
