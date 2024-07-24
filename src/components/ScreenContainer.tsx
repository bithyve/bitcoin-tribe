import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

const ScreenContainer = props => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <SafeAreaView style={{ ...styles.container, ...props.style }}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primaryBackground}
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
      padding: hp(15),
    },
  });
export default ScreenContainer;
