import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
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
});

const ModalLoading = (props: ModalProps) => {
  return (
    <Modal
      isVisible={props.visible}
      backdropOpacity={0.6}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={styles.container}>
      <View>
        <ActivityIndicator size="large" color={Colors.ChineseOrange} />
      </View>
    </Modal>
  );
};

export default ModalLoading;
