import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTouchable from 'src/components/AppTouchable';
import IconSend from 'src/assets/images/ic_send_msg.svg';
import IconSendLight from 'src/assets/images/ic_send_msg_light.svg';
import IconPlus from 'src/assets/images/ic_plus.svg';
import IconPlusLight from 'src/assets/images/ic_plus_light.svg';
import IconClose from 'src/assets/images/ic_close.svg';
import IconCloseLight from 'src/assets/images/ic_close_light.svg';
import IconSendImage from 'src/assets/images/ic_send_image.svg';
import IconSendImageLight from 'src/assets/images/ic_send_image_light.svg';
import IconRequest from 'src/assets/images/ic_request.svg';
import IconRequestLight from 'src/assets/images/ic_request_light.svg';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import TextField from 'src/components/TextField';
import { hp } from 'src/constants/responsive';

const getStyles = (theme: AppTheme, inputHeight: number) =>
  StyleSheet.create({
    containerBottom: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    containerBottomDisabled: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    btnSend: {
      padding: 5,
      alignItems: 'center',
      marginTop: 5,
      position: 'absolute',
      right: 5,
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
    input: {
      marginVertical: hp(5),
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
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
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [showOptions, setShowOptions] = useState(false);

  const renderPlusIcon = useMemo(() => {
    const isDark = theme.dark;
    return showOptions ? (
      isDark ? (
        <IconClose />
      ) : (
        <IconCloseLight />
      )
    ) : isDark ? (
      <IconPlus />
    ) : (
      <IconPlusLight />
    );
  }, [theme.dark, showOptions]);

  return (
    <View>
      <View style={styles.containerBottom}>
        <TextField
          ref={descriptionInputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={'Type a Message...'}
          onContentSizeChange={event =>
            setInputHeight(event.nativeEvent.contentSize.height)
          }
          keyboardType={'default'}
          returnKeyType="next"
          multiline={true}
          numberOfLines={3}
          style={[styles.input, message && styles.descInput]}
          inputStyle={{maxWidth:'90%'}}
          blurOnSubmit={false}
          disabled={disabled}
        />

        <AppTouchable
          disabled={message.trim() === '' || disabled}
          style={styles.btnSend}
          onPress={() => onPressSend()}>
          {theme.dark ? <IconSend /> : <IconSendLight />}
        </AppTouchable>
      </View>
      {/* {showOptions && (
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
            {
              icon: theme.dark ? <IconChatSend /> : <IconChatSendLight />,
              label: 'Send',
              onPress: () => {
                setShowOptions(false);
                _onPressSend();
              },
            },
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
              onPress={option.onPress}>
              {option.icon}
              <AppText style={styles.optionItemText} variant="body2">
                {option.label}
              </AppText>
            </AppTouchable>
          ))}
        </View>
      )} */}
    </View>
  );
};

export default MessageInput;
