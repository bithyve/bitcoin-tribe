import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

const TextField = props => {
  return (
    <TextInput
      underlineColor="transparent"
      placeholder={props.placeholder}
      style={styles.container}
      value={props.value}
      onChangeText={text => props.onChangeText(text)}
      keyboardType={props.keyboardType}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '95%',
    borderRadius: 6,
    margin: 10,
  },
});

export default TextField;
