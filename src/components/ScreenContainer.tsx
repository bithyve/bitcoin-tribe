import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';

import { AppTheme } from 'src/theme';

const ScreenContainer = props => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <SafeAreaView style={{ ...styles.container, ...props.style }}>
      <StatusBar
        barStyle={isThemeDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primaryBackground}
        translucent={true}
      />
      {props.children}
    </SafeAreaView>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
      paddingHorizontal: hp(16),
      paddingBottom: hp(16),
      paddingTop: windowHeight < 675 ? hp(16) : hp(10),
    },
  });
export default ScreenContainer;
