import * as React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity
      style={styles.ctaContainerStyle}
      onPress={props.onPress}
      testID="btn_primary">
      <Text
        style={[
          CommonStyles.primaryCTATitle,
          { color: theme.colors.textColor },
        ]}>
        {props.title}
      </Text>
    </TouchableOpacity>
    // <Button
    //   mode="contained"
    //   uppercase={false}
    //   labelStyle={CommonStyles.primaryCTATitle}
    //   style={styles.ctaContainerStyle}
    //   buttonColor={theme.colors.primaryCTA}
    //   onPress={props.onPress}>
    //   {props.title}
    // </Button>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    ctaContainerStyle: {
      borderRadius: 8,
      height: hp(50),
      minWidth: wp(150),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryCTA,
    },
  });
export default PrimaryCTA;
