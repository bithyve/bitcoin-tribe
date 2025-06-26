import React from 'react';
import { Platform, ActivityIndicator, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { hp } from 'src/constants/responsive';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';

const LoadingSpinner = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return Platform.OS === 'ios' ? (
    <LottieView
      source={require('src/assets/images/jsons/loader.json')}
      style={styles.loaderStyle}
      autoPlay
      loop
    />
  ) : (
    <ActivityIndicator
      size="small"
      color={theme.colors.accent1}
      style={styles.activityIndicatorWrapper}
    />
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    loaderStyle: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
    activityIndicatorWrapper: {
      marginTop: hp(20),
    },
  });

export default LoadingSpinner;
