import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import Fonts from 'src/constants/Fonts';

type RoundedCTAProps = {
  icon?: React.ReactNode;
  buttonColor?: string;
  onPress?: () => void;
  title: string;
  height?: number;
  width?: number;
};

function RoundedCTA(props: RoundedCTAProps) {
  const { icon, buttonColor, onPress, title, height, width } = props;
  const styles = getStyles(width);
  return (
    <Button
      icon={() => icon}
      mode="contained"
      uppercase={false}
      labelStyle={[styles.roundedCTATitle, styles.labelStyle]}
      style={styles.ctaContainerStyle}
      contentStyle={styles.contentStyle}
      buttonColor={buttonColor}
      onPress={onPress}
      maxFontSizeMultiplier={1}>
      {title}
    </Button>
  );
}
const getStyles = width =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentStyle: {
      width: width,
    },
    labelStyle: {
      marginLeft: 0,
    },
    roundedCTATitle: {
      fontSize: 13,
      fontFamily: Fonts.PoppinsSemiBold,
      lineHeight: 13 * 1.5,
      height: 18,
      marginLeft: 10,
    },
  });
export default RoundedCTA;
