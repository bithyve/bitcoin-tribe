import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';

type PrimaryCTAProps = {
  onPress: any;
  title: string;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const theme = useTheme();
  return (
    <Button
      mode="contained"
      uppercase={false}
      labelStyle={CommonStyles.primaryCTATitle}
      style={styles.ctaContainerStyle}
      buttonColor={theme.colors.primaryCTA}
      onPress={props.onPress}>
      {props.title}
    </Button>
  );
}
const styles = StyleSheet.create({
  ctaContainerStyle: {
    borderRadius: 10,
  },
});
export default PrimaryCTA;
