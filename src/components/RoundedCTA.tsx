import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import Fonts from 'src/constants/Fonts';
import { AppTheme } from 'src/theme';
import GradientView from './GradientView';
import { hp } from 'src/constants/responsive';

type RoundedCTAProps = {
  icon?: React.ReactNode;
  buttonColor?: string;
  onPress?: () => void;
  title: string;
  height?: number;
  width?: number;
  colors?: [string, string, string];
  textColor?: string;
};

function RoundedCTA(props: RoundedCTAProps) {
  const theme: AppTheme = useTheme();
  const {
    icon,
    buttonColor,
    onPress,
    title,
    height,
    width,
    colors = [
      theme.colors.cardGradient1,
      theme.colors.cardGradient2,
      theme.colors.cardGradient3,
    ],
    textColor = theme.colors.headingColor,
  } = props;
  const styles = getStyles(width, buttonColor);
  return (
    <GradientView style={styles.ctaContainerStyle} colors={colors}>
      <Button
        icon={() => icon}
        mode="outlined"
        uppercase={false}
        labelStyle={[styles.roundedCTATitle, styles.labelStyle]}
        style={styles.ctaContainerStyle}
        contentStyle={styles.contentStyle}
        // buttonColor={buttonColor}
        textColor={textColor}
        onPress={onPress}
        maxFontSizeMultiplier={1}>
        {title}
      </Button>
    </GradientView>
  );
}
const getStyles = (width, buttonColor) =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: buttonColor,
      borderWidth: 0.5,
    },
    contentStyle: {
      height: hp(48),
      width: width,
    },
    labelStyle: {
      marginLeft: 5,
    },
    roundedCTATitle: {
      fontSize: 16,
      fontFamily: Fonts.LufgaRegular,
      lineHeight: 16 * 1.5,
      height: 25,
      marginLeft: 10,
    },
  });
export default RoundedCTA;
