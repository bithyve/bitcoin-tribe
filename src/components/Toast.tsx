import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';

const Toast = props => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <Snackbar
      visible={props.visible}
      onDismiss={props.onDismissSnackBar}
      elevation={5}
      //   duration={2000}
      style={styles.container}>
      {props.message}
    </Snackbar>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.primaryCTA,
      borderRadius: 10,
    },
  });
export default Toast;
