import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';

type TransactionCTAProps = {
  icon?: any;
  buttonColor?: any;
  onPress?: any;
  title: string;
};

function TransactionCTA(props: TransactionCTAProps) {
  return (
    <Button
      testID="btn_TransactionCTA"
      icon={() => props.icon}
      mode="contained"
      uppercase={false}
      labelStyle={CommonStyles.transactionCTATitle}
      style={styles.ctaContainerStyle}
      buttonColor={props.buttonColor}
      onPress={props.onPress}>
      {props.title}
    </Button>
  );
}
const styles = StyleSheet.create({
  ctaContainerStyle: {
    borderRadius: 25,
  },
});
export default TransactionCTA;