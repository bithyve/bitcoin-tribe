import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';

import Colors from 'src/theme/Colors';
import CheckIcon from 'src/assets/images/icon_check.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import AppText from './AppText';
import Fonts from 'src/constants/Fonts';

// Need to work
export default (message, icon = false, error = false) => {
  return Toast.show(
    <View style={styles.container}>
      {icon && <CheckIcon />}
      <AppText style={styles.toastMessageStyle}>
        {message && message.length > 100
          ? `${message.substring(0, 100)}...`
          : message}
      </AppText>
    </View>,
    {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      opacity: 1,
      backgroundColor: Colors.ScreaminGreen,
      textColor: Colors.RaisinBlack,
      containerStyle: { marginBottom: (windowWidth * 22) / 100 },
    },
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: wp(300),
    minHeight: hp(50),
    borderRadius: 65,
    padding: 10,
  },
  toastMessageStyle: {
    color: Colors.RaisinBlack,
    marginLeft: wp(8),
    fontSize: 14,
    fontFamily: Fonts.LufgaSemiBold,
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: '600',
  },
});
