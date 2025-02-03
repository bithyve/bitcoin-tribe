import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import SliderComponent from '@react-native-community/slider';
import AppText from './AppText';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import Fonts from 'src/constants/Fonts';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import Colors from 'src/theme/Colors';

const { width } = Dimensions.get('window');

type Props = {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  title?: string;
};

const Slider = (props: Props) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const sliderWidth = width - 20;
  const animatedPosition = useRef(new Animated.Value(0)).current;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const handleValueChange = value => {
    const sliderThumbOffset =
      ((value - props.minimumValue) /
        (props.maximumValue - props.minimumValue)) *
      sliderWidth;

    Animated.timing(animatedPosition, {
      toValue: sliderThumbOffset,
      duration: 110,
      useNativeDriver: false,
    }).start();
    props.onValueChange(value);
  };

  return (
    <View style={styles.container}>
      {props.title && (
        <AppText style={styles.title} variant="secondaryCta">
          {props.title}
        </AppText>
      )}

      <SliderComponent
        style={styles.slider}
        minimumValue={props.minimumValue}
        maximumValue={props.maximumValue}
        step={props.step}
        tapToSeek
        value={props.value}
        onValueChange={handleValueChange}
        minimumTrackTintColor={
          isThemeDark ? Colors.Golden : Colors.BrandeisBlue
        }
        maximumTrackTintColor="#24262B"
        thumbTintColor={isThemeDark ? Colors.Golden : Colors.BrandeisBlue}
      />

      <Animated.Text
        style={[
          styles.valueText,
          {
            left: animatedPosition.interpolate({
              inputRange: [0, sliderWidth],
              outputRange: [10, sliderWidth - 45],
            }),
          },
        ]}>
        {props.value}
      </Animated.Text>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
      height: Platform.select({
        ios: 80,
        android: 70,
      }),
    },
    slider: {
      padding: 0,
      margin: 0,
    },
    valueText: {
      position: 'absolute',
      bottom: 0,
      color: theme.colors.text,
      fontSize: 15,
      textAlign: 'center',
      fontFamily: Fonts.LufgaRegular,
    },
    title: {
      marginBottom: 5,
      color: theme.colors.secondaryHeadingColor,
    },
  });

export default Slider;
