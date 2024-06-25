import React from 'react';
import { StyleSheet, ImageBackground, StatusBar } from 'react-native';
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
      <ImageBackground
        source={require('src/assets/images/image_background.png')}
        resizeMode="cover"
        style={{ ...styles.image, ...props.style }}>
        {props.children}
      </ImageBackground>
    </SafeAreaView>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
    },
    image: {
      height: '100%',
      width: '100%',
      paddingHorizontal: hp(25),
      paddingTop: hp(15),
    },
  });
export default ScreenContainer;
