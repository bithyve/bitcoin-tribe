import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';

type ModalProps = {
  visible: boolean;
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    margin: 0,
    zIndex: 999,
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
