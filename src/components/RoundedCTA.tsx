import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import CommonStyles from 'src/common/styles/CommonStyles';

type RoundedCTAProps = {
  icon?: any;
  buttonColor?: any;
  onPress?: any;
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
      labelStyle={CommonStyles.roundedCTATitle}
      style={styles.ctaContainerStyle}
      contentStyle={styles.contentStyle}
      buttonColor={buttonColor}
      onPress={onPress}>
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
  });
export default RoundedCTA;
