import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';

const RefreshControlView = ({ refreshing, onRefresh }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={'transparent'}>
      {refreshing && (
        <LottieView
          source={require('src/assets/images/loader.json')}
          autoPlay
          loop
          style={styles.refreshLoader} // Adjust the size as needed
        />
      )}
    </RefreshControl>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    refreshLoader: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
  });

export default RefreshControlView;
