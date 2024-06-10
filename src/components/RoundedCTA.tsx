import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';

type RoundedCTAProps = {
  icon?: any;
  buttonColor?: any;
  onPress?: any;
  title: string;
  height?: number;
  width?: number;
};

function RoundedCTA(props: RoundedCTAProps) {
  const styles = getStyles(props);
  return (
    <Button
      icon={() => props.icon}
      mode="contained"
      uppercase={false}
      labelStyle={CommonStyles.roundedCTATitle}
      style={styles.ctaContainerStyle}
      contentStyle={styles.contentStyle}
      buttonColor={props.buttonColor}
      onPress={props.onPress}>
      {props.title}
    </Button>
  );
}
const getStyles = props =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentStyle: {
      width: props.width,
    },
  });
export default RoundedCTA;
