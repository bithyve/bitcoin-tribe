import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { NavigationState } from 'react-native-tab-view';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type TabRoute = {
  key: string;
  title: string;
};

type Props = {
  navigationState: NavigationState<TabRoute>;
  jumpTo: (key: string) => void;
};

const AssetsTabBar: React.FC<Props> = ({ navigationState, jumpTo }) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  return (
    <View style={styles.container}>
      {navigationState.routes.map((route, index) => {
        const isActive = navigationState.index === index;
        return (
          <AppTouchable
            key={route.key}
            onPress={() => jumpTo(route.key)}
            style={isActive ? styles.wrapperActive : styles.wrapper}>
            <AppText
              variant="body2"
              style={{
                color: isActive
                  ? isThemeDark
                    ? theme.colors.primaryText
                    : '#fff'
                  : isThemeDark
                  ? theme.colors.secondaryHeadingColor
                  : theme.colors.secondaryHeadingColor,
              }}>
              {route.title}
            </AppText>
          </AppTouchable>
        );
      })}
    </View>
  );
};

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: hp(5),
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#1F1F1F' : '#ffffff',
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: hp(12),
      marginHorizontal: hp(10),
    },
    wrapperActive: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: hp(12),
      backgroundColor: theme.colors.accent1,
      borderRadius: hp(20),
      marginHorizontal: hp(10),
    },
  });

export default AssetsTabBar;
