import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  radius?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
  isAnimated?: boolean;
  disabled?: boolean;
};

export default function GradientBorderAnimated({
  radius = 20,
  strokeWidth = 1,
  children,
  height = 100,
  style,
  isAnimated = true,
  disabled = false,
}: Props) {
  const [box, setBox] = useState({ width: 0, height: 0 });

  const angle = useSharedValue(0);

  useEffect(() => {
    if (isAnimated && !disabled) {
      angle.value = withRepeat(withTiming(360, { duration: 5000 }), -1, false);
    } else if (disabled) {
      cancelAnimation(angle);
      angle.value = 0;
    }
  }, [isAnimated, disabled]);

  const animatedProps = useAnimatedProps(() => {
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const radian = (angle.value * Math.PI) / 180;

    const x1 = centerX + Math.cos(radian) * 100;
    const y1 = centerY + Math.sin(radian) * 100;

    const x2 = centerX + Math.cos(radian + Math.PI) * 100;
    const y2 = centerY + Math.sin(radian + Math.PI) * 100;

    return {
      x1: x1.toString(),
      y1: y1.toString(),
      x2: x2.toString(),
      y2: y2.toString(),
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  };

  return (
    <View
      onLayout={onLayout}
      pointerEvents={disabled ? 'none' : 'auto'}
      style={[styles.wrapper, { height }, style, disabled && { opacity: 0.5 }]}>
      {box.width > 0 && box.height > 0 && (
        <Svg
          width={box.width}
          height={box.height}
          style={StyleSheet.absoluteFill}>
          <Defs>
            <AnimatedLinearGradient
              id="movingBorder"
              gradientUnits="userSpaceOnUse"
              animatedProps={animatedProps}>
              <Stop offset="0%" stopColor="#FFD600" />
              <Stop offset="10%" stopColor="#FF423E" />
              <Stop offset="30%" stopColor="#0166FF" />
              <Stop offset="50%" stopColor="#8904F9" />
              <Stop offset="70%" stopColor="#01FFE3" />
              <Stop offset="90%" stopColor="#FFD600" />
            </AnimatedLinearGradient>
          </Defs>

          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={box.width - strokeWidth}
            height={box.height - strokeWidth}
            rx={radius}
            ry={radius}
            fill="none"
            stroke="url(#movingBorder)"
            strokeWidth={strokeWidth}
          />
        </Svg>
      )}

      <View
        style={[
          styles.content,
          {
            borderRadius: radius - strokeWidth,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  content: {},
});
