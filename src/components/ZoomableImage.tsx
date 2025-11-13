import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { hp } from 'src/constants/responsive';

export const ZoomableImage = ({
  uri,
  imageView,
  min = 1,
  max = 3,
  setLoadingImage,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      if (imageView) {
        const scaled = savedScale.value * e.scale;
        scale.value = scaled < min ? min : scaled > max ? max : scaled;
      }
    })
    .onEnd(() => {
      if (imageView) savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (imageView) scale.value = scale.value === min ? max : min;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const combinedGesture = Gesture.Simultaneous(pinchGesture, doubleTap);

  useEffect(() => {
    if (!imageView) {
      scale.value = 1;
      savedScale.value = 1;
    }
  }, [imageView]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.Image
        source={{ uri }}
        resizeMode={imageView ? 'contain' : 'cover'}
        style={[
          styles.imageStyle,
          animatedStyle,
          !imageView && { maxHeight: hp(375) },
        ]}
        onLoadStart={() => setLoadingImage(true)}
        onLoadEnd={() => setLoadingImage(false)}
        onError={() => setLoadingImage(false)}
      />
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: '100%',
    height: '100%',
    alignItems: 'center', justifyContent: 'center' 
  },
});
