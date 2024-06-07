import * as React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';
import { wp } from '../constants/responsive';

type TransactionCTAProps = {
  icon?: any;
  buttonColor?: any;
  onPress?: any;
  title: string;
  height: number;
  width: number;
};

function TransactionCTA(props: TransactionCTAProps) {
  const theme = useTheme();
  const styles = getStyles(theme, props);
  return (
    <TouchableOpacity
      style={styles.ctaContainerStyle}
      onPress={props.onPress}
      testID="btn_TransactionCTA">
      <View style={styles.iconWrapper}>{props.icon}</View>
      <Text
        style={[
          CommonStyles.transactionCTATitle,
          { color: theme.colors.textColor },
        ]}>
        {props.title}
      </Text>
    </TouchableOpacity>
    // <Button
    //   testID="btn_TransactionCTA"
    //   icon={() => props.icon}
    //   mode="contained"
    //   uppercase={false}
    //   labelStyle={CommonStyles.transactionCTATitle}
    //   style={styles.ctaContainerStyle}
    //   buttonColor={props.buttonColor}
    //   onPress={props.onPress}>
    //   {props.title}
    // </Button>
  );
}
const getStyles = (theme, props) =>
  StyleSheet.create({
    ctaContainerStyle: {
      flexDirection: 'row',
      borderRadius: 18,
      height: props.height,
      minWidth: props.width,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: props.buttonColor,
    },
    iconWrapper: {
      marginRight: wp(5),
    },
  });
export default TransactionCTA;
