import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';

import Colors from 'src/theme/Colors';

type ModalProps = {
  visible: boolean;
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    margin: 0,
  },
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderStyle: {
    alignSelf: 'center',
    width: '35%',
    height: '35%',
  },
});

const ModalLoading = (props: ModalProps) => {
  return (
    <Modal
      isVisible={props.visible}
      backdropOpacity={0.7}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={styles.container}>
      <View style={styles.loaderWrapper}>
        {/* <ActivityIndicator size="large" color={Colors.ChineseOrange} /> */}
        <LottieView
          source={require('src/assets/images/loader.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      </View>
    </Modal>
  );
};

export default ModalLoading;
