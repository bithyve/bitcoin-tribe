import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  } from 'react-native';
import AppTouchable from 'src/components/AppTouchable';
import IconSend from 'src/assets/images/ic_send_msg.svg';
import IconSendLight from 'src/assets/images/ic_send_msg_light.svg';
import IconPlus from 'src/assets/images/ic_plus.svg';
import IconPlusLight from 'src/assets/images/ic_plus_light.svg';
import IconClose from 'src/assets/images/ic_close.svg';
import IconCloseLight from 'src/assets/images/ic_close_light.svg';
import IconSendImage from 'src/assets/images/ic_send_image.svg';
import IconSendImageLight from 'src/assets/images/ic_send_image_light.svg';
import IconChatSend from 'src/assets/images/ic_chat_send.svg';
import IconChatSendLight from 'src/assets/images/ic_chat_send_light.svg';
import IconRequest from 'src/assets/images/ic_request.svg';
import IconRequestLight from 'src/assets/images/ic_request_light.svg';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

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
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    marginTop: 10,
  },
  optionItem: {
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionItemText: {
    marginTop: 5,
  },
});

const MessageInput = ({
  message,
  setMessage,
  loading,
  disabled,
  onPressSend,
  onPressImage,
  onPressRequest,
  _onPressSend,
}: {
  message: string;
  setMessage: (message: string) => void;
  loading: boolean;
  disabled: boolean;
  onPressSend: () => void;
  onPressImage: () => void;
  onPressRequest: () => void;
  _onPressSend: () => void;
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [showOptions, setShowOptions] = useState(false);

  const renderPlusIcon = useMemo(() => {
    const isDark = theme.dark;
    return showOptions 
      ? (isDark ? <IconClose /> : <IconCloseLight />)
      : (isDark ? <IconPlus /> : <IconPlusLight />);
  }, [theme.dark, showOptions]);

  return (
    <View>
    <View style={styles.containerBottom}>

      <AppTouchable style={styles.btnPlus} onPress={() => {
        Keyboard.dismiss();
        setShowOptions(!showOptions)
      }}>
        {renderPlusIcon}
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
        onFocus={() => setShowOptions(false)}
      />

      <AppTouchable disabled={message.trim() === '' || disabled} style={styles.btnSend} onPress={() => onPressSend()}>
        {theme.dark ? <IconSend /> : <IconSendLight />}
      </AppTouchable>
    </View>
    {showOptions && (
      <View style={styles.optionsContainer}>
        {[
          {
            icon: theme.dark ? <IconSendImage /> : <IconSendImageLight />,
            label: 'Image',
            onPress: () => {
              setShowOptions(false);
              onPressImage();
            },
          },
          // {
          //   icon: theme.dark ? <IconChatSend /> : <IconChatSendLight />,
          //   label: 'Send',
          //   onPress: () => {
          //     setShowOptions(false);
          //     _onPressSend();
          //   },
          // },
          {
            icon: theme.dark ? <IconRequest /> : <IconRequestLight />,
            label: 'Request',
            onPress: () => {
              setShowOptions(false);
              onPressRequest();
            },
          },
        ].map((option, index) => (
          <AppTouchable
            key={index}
            style={styles.optionItem}
            onPress={option.onPress}
          >
            {option.icon}
            <AppText style={styles.optionItemText} variant='body2'>
              {option.label}
            </AppText>
          </AppTouchable>
        ))}
      </View>
    )}
    </View>
  );
};

export default MessageInput;