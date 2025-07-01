import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import AppTouchable from 'src/components/AppTouchable';
import IconSend from 'src/assets/images/icon_send.svg';
import IconSendLight from 'src/assets/images/ic_send_light.svg';
import IconPlus from 'src/assets/images/ic_plus.svg';
import IconPlusLight from 'src/assets/images/ic_plus_light.svg';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';

const getStyles = (theme: AppTheme) => StyleSheet.create({
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
    backgroundColor: theme.dark ? '#24262B' : '#FFF',
    fontSize: 16,
    fontFamily: 'Lufga-Regular',
    color: theme.dark ? 'white' : '#24262B',
    textAlignVertical: 'top',
  },
  btnSend: {
    padding: 5,
    alignItems: 'center',
    marginTop: 5,
    position: 'absolute',
    right: 15,
  },
  btnPlus: {
    paddingRight: 5,
    alignItems: 'center',
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
    color: theme.colors.secondaryHeadingColor,
  },
});

const MessageInput = ({
  message,
  setMessage,
  loading,
  disabled,
  onPressSend,
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.containerBottom}>

      <AppTouchable style={styles.btnPlus} onPress={() => {
        console.log('onPressSend');
      }}>
        {theme.dark ? <IconPlus /> : <IconPlusLight />}
      </AppTouchable>

      <TextInput
        value={message}
        onChangeText={(text) => setMessage(text)}
        style={styles.textInputMsg}
        numberOfLines={3}
        multiline
        editable={!loading && !disabled}
        placeholder='Type a Message...'
        placeholderTextColor={theme.colors.secondaryHeadingColor}
      />

      <AppTouchable disabled={message.trim() === '' || disabled} style={styles.btnSend} onPress={() => onPressSend()}>
        {theme.dark ? <IconSend /> : <IconSendLight />}
      </AppTouchable>
    </View>
  );
};

export default MessageInput;