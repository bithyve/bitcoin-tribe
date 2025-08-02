import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import SwipeIcon from 'src/assets/images/swipeIcon.svg';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';
import AnimatedDots from './AnimatedDots';

const { width } = Dimensions.get('window');
const SWIPE_LENGTH = width - hp(50) - 70;

interface Props {
  title: string;
  loadingTitle: string;
  onSwipeComplete: () => void;
  backColor?: string;
  loaderTextColor?: string;
  resetCounter?: number;
}

const SwipeToAction: React.FC<Props> = ({
  onSwipeComplete,
  title,
  loadingTitle,
  backColor = Colors.Golden,
  loaderTextColor = Colors.Black,
  resetCounter,
}) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, backColor, loaderTextColor),
    [theme, backColor, loaderTextColor],
  );
  const [swiped, setSwiped] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const autoSwipe = useRef(new Animated.Value(0)).current;
  const autoSwipeAnimation = useRef(null);

  useEffect(() => {
    startSwipeIndicator();
    return () => stopSwipeIndicator();
  }, []);

  useEffect(() => {
    if (resetCounter !== undefined) {
      translateX.setValue(0);
      autoSwipe.setValue(0);
      setSwiped(false);
      stopSwipeIndicator();
      startSwipeIndicator();
    }
  }, [resetCounter]);

  const startSwipeIndicator = () => {
    if (!autoSwipeAnimation.current) {
      autoSwipeAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(autoSwipe, {
            toValue: 0.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(autoSwipe, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      autoSwipeAnimation.current.start();
    }
  };

  const stopSwipeIndicator = () => {
    if (autoSwipeAnimation.current) {
      autoSwipeAnimation.current.stop();
      autoSwipeAnimation.current = null;
      autoSwipe.setValue(0);
    }
  };

  const triggerHapticFeedback = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactHeavy', options);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.state === State.BEGAN) {
      stopSwipeIndicator();
    }
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > 180) {
        setSwiped(true);
        triggerHapticFeedback();
        onSwipeComplete();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        //startSwipeIndicator();
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {!swiped ? (
        <Animated.View style={[styles.track]}>
          <View style={styles.dynamicBackgroundContainer}>
            <Animated.View
              style={[
                styles.dynamicBackground,
                {
                  transform: [
                    {
                      scaleX: Animated.add(
                        translateX.interpolate({
                          inputRange: [0, SWIPE_LENGTH],
                          outputRange: [0.2, 1],
                          extrapolate: 'clamp',
                        }),
                        autoSwipe.interpolate({
                          inputRange: [0, SWIPE_LENGTH],
                          outputRange: [0, 70],
                        }),
                      ),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Animated.Text
            style={[
              styles.trackText,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      translateX.interpolate({
                        inputRange: [0, SWIPE_LENGTH / 2],
                        outputRange: [0, SWIPE_LENGTH / 3],
                        extrapolate: 'clamp',
                      }),
                      autoSwipe.interpolate({
                        inputRange: [0, 0.2],
                        outputRange: [0, 10],
                      }),
                    ),
                  },
                ],
                opacity: translateX.interpolate({
                  inputRange: [0, SWIPE_LENGTH - 200],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            {title}
          </Animated.Text>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                styles.thumb,
                {
                  transform: [
                    {
                      translateX: Animated.add(
                        translateX.interpolate({
                          inputRange:
                            Platform.OS === 'ios'
                              ? [0, SWIPE_LENGTH]
                              : [0, SWIPE_LENGTH],
                          outputRange:
                            Platform.OS === 'ios'
                              ? [0, SWIPE_LENGTH]
                              : [0, SWIPE_LENGTH],
                          extrapolate: 'clamp',
                        }),
                        autoSwipe.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 100],
                        }),
                      ),
                    },
                  ],
                },
              ]}>
              <SwipeIcon />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      ) : (
        <View style={styles.containerLoading}>
          <Animated.Text style={styles.textLoading}>
            {loadingTitle}
          </Animated.Text>
          <AnimatedDots />
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const getStyles = (theme: AppTheme, backColor, loaderTextColor) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    track: {
      width: '100%',
      height: 60,
      backgroundColor: Colors.White,
      borderRadius: 18,
      justifyContent: 'center',
      position: 'relative',
    },
    trackText: {
      textAlign: 'center',
      color: theme.colors.popupCTATitleColor,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: Fonts.LufgaMedium,
    },
    thumb: {
      width: 45,
      height: 40,
      backgroundColor: Colors.White,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 8,
    },
    successText: {
      fontSize: 24,
      color: Colors.Golden,
      fontWeight: 'bold',
    },
    dynamicBackground: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      backgroundColor: backColor,
      transformOrigin: 'left',
      borderRadius: 18,
    },
    dynamicBackgroundContainer: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
    },
    containerLoading: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backColor,
      width: '100%',
      height: 56,
      borderRadius: 18,
    },
    textLoading: {
      fontSize: 16,
      fontFamily: Fonts.LufgaRegular,
      color: loaderTextColor,
    },
  });

export default SwipeToAction;
