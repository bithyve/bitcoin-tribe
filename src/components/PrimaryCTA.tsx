import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';
import { hp, wp } from '../constants/responsive';

type PrimaryCTAProps = {
  onPress: any;
  title: string;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <Button
      mode="contained"
      uppercase={false}
      labelStyle={[CommonStyles.primaryCTATitle, styles.labelStyle]}
      style={styles.ctaContainerStyle}
      buttonColor={theme.colors.primaryCTA}
      onPress={props.onPress}>
      {props.title}
    </Button>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 10,
    },
    labelStyle: {
      minWidth: wp(120),
      marginVertical: hp(14),
    },
  });
export default PrimaryCTA;
