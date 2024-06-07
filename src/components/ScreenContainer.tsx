import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { useTheme } from 'react-native-paper';

const ScreenContainer = props => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={{ ...styles.container, ...props.style }}>
      <ImageBackground
        source={require('../assets/images/image_background.png')}
        resizeMode="cover"
        style={styles.image}>
        {props.children}
      </ImageBackground>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackgroundColor,
    },
    image: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
export default ScreenContainer;
