import React from 'react';
import { StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp } from '../constants/responsive';

const ScreenContainer = props => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <SafeAreaView style={{ ...styles.container, ...props.style }}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primaryBackground}
      />
      <ImageBackground
        source={require('../assets/images/image_background.png')}
        resizeMode="cover"
        style={styles.image}>
        {props.children}
      </ImageBackground>
    </SafeAreaView>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
    },
    image: {
      flex: 1,
      padding: hp(20),
    },
  });
export default ScreenContainer;
