import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';

const ScreenContainer = props => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#434343',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default ScreenContainer;
