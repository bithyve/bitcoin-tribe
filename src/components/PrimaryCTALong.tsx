import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';
import { hp, wp } from '../constants/responsive';

type PrimaryCTAProps = {
  onPress: any;
  title: string;
};

function PrimaryCTALong(props: PrimaryCTAProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <TouchableOpacity
      style={styles.ctaContainerStyle}
      onPress={props.onPress}
      testID="btn_primary_cta_long">
      <Text
        style={[
          CommonStyles.primaryCTATitle,
          { color: theme.colors.textColor },
        ]}>
        {props.title}
      </Text>
    </TouchableOpacity>
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
export default PrimaryCTALong;
