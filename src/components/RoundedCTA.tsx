import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import Fonts from 'src/constants/Fonts';
import { AppTheme } from 'src/theme';

type RoundedCTAProps = {
  icon?: React.ReactNode;
  buttonColor?: string;
  onPress?: () => void;
  title: string;
  height?: number;
  width?: number;
};

function RoundedCTA(props: RoundedCTAProps) {
  const theme: AppTheme = useTheme();
  const { icon, buttonColor, onPress, title, height, width } = props;
  const styles = getStyles(width, buttonColor);
  return (
    <Button
      icon={() => icon}
      mode="outlined"
      uppercase={false}
      labelStyle={[styles.roundedCTATitle, styles.labelStyle]}
      style={styles.ctaContainerStyle}
      contentStyle={styles.contentStyle}
      // buttonColor={buttonColor}
      textColor={theme.colors.headingColor}
      onPress={onPress}
      maxFontSizeMultiplier={1}>
      {title}
    </Button>
  );
}
const getStyles = (width, buttonColor) =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: buttonColor,
      borderWidth: 1,
    },
    contentStyle: {
      width: width,
    },
    labelStyle: {
      marginLeft: 5,
    },
    roundedCTATitle: {
      fontSize: 16,
      fontFamily: Fonts.LufgaSemiBold,
      lineHeight: 16 * 1.5,
      height: 25,
      marginLeft: 10,
    },
  });
export default RoundedCTA;
