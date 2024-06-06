import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Toast from 'react-native-root-toast';

import Colors from '../theme/Colors';
import CheckIcon from '../assets/images/icon_check.svg';
import CommonStyles from '../common/styles/CommonStyles';
// Need to work
export default (message, icon = false, error = false) => {
  return Toast.show(
    <View style={styles.container}>
      {icon && <CheckIcon />}
      <Text style={[CommonStyles.toastMessage, styles.toastMessageStyle]}>
        {message && message.length > 100
          ? `${message.substring(0, 100)}...`
          : message}
      </Text>
    </View>,
    {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      opacity: 1,
      backgroundColor: Colors.ChineseOrange,
      textColor: Colors.RaisinBlack,
    },
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 300,
    minHeight: 60,
    borderRadius: 50,
  },
  toastMessageStyle: {
    color: Colors.RaisinBlack,
    paddingLeft: 10,
    flex: 1,
    flexWrap: 'wrap',
  },
});
