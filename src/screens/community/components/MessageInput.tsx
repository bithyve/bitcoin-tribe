import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import AppTouchable from 'src/components/AppTouchable';
import IconSend from 'src/assets/images/icon_send.svg';

const styles = StyleSheet.create({
  containerBottom: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  containerBottomDisabled: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  textInputMsg: {
    borderRadius: 15,
    padding: 10,
    maxHeight: 80,
    minHeight: 60,
    paddingLeft: 15,
    paddingRight: 35,
    flex: 1,
    backgroundColor: '#24262B',
    fontSize: 16,
    fontFamily: 'Lufga-Regular',
    color: 'white',
  },
  btnSend: {
    padding: 5,
    alignItems: 'center',
    marginTop: 5,
    position: 'absolute',
    right: 15,
  },
  containerTextInputIcons: {
    position: 'absolute',
    right: 0,
    marginRight: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
  },
});

const MessageInput = ({
  message,
  setMessage,
  loading,
  disabled,
  onPressSend,
}) => {

  return (
    <View style={styles.containerBottom}>
      <TextInput
        value={message}
        onChangeText={(text) => setMessage(text)}
        style={styles.textInputMsg}
        numberOfLines={3}
        multiline
        editable={!loading && !disabled}
        placeholder='Type a Message...'
        placeholderTextColor='#787878'
        placeholderStyle={styles.placeholderText}
      />

      <AppTouchable style={styles.btnSend} onPress={() => onPressSend()}>
        <IconSend />
      </AppTouchable>
    </View>
  );
};

export default MessageInput;