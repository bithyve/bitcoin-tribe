import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';

import Colors from 'src/theme/Colors';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import AppText from './AppText';
import Fonts from 'src/constants/Fonts';
import LottieView from 'lottie-react-native';

// Need to work
export default (message, error = false) => {
  return Toast.show(
    <View style={styles.container}>
      {error ? (
        <LottieView
          source={require('src/assets/images/errorToast.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      ) : (
        <LottieView
          source={require('src/assets/images/successToast.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      )}
      <AppText
        style={[
          styles.toastMessageStyle,
          { color: error ? Colors.White : Colors.RaisinBlack },
        ]}>
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
      backgroundColor: error ? Colors.FireOpal : Colors.ScreaminGreen,
      textColor: error ? Colors.ImperialRed : Colors.RaisinBlack,
      borderColor: error ? Colors.ImperialRed : Colors.ScreaminGreen,
      borderWidth: 1,
      containerStyle: {
        marginBottom: (windowWidth * 22) / 100,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
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
    padding: 10,
  },
  toastMessageStyle: {
    marginLeft: wp(8),
    fontSize: 14,
    fontFamily: Fonts.LufgaSemiBold,
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: '600',
  },
  loaderStyle: {
    height: hp(35),
    width: hp(35),
  },
});
