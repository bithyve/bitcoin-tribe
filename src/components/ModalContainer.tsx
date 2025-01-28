import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Modal from 'react-native-modal';

import IconClose from 'src/assets/images/icon_close.svg';
import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import KeyboardAvoidView from './KeyboardAvoidView';
import Colors from 'src/theme/Colors';

type ModalContainerProps = {
  title: string;
  subTitle?: string;
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
  height?: string;
  enableCloseIcon?: boolean;
  onModalHide?: () => void
};

const ModalContainer = (props: ModalContainerProps) => {
  const theme: AppTheme = useTheme();
  const {
    visible,
    onDismiss,
    children,
    title,
    subTitle,
    conatinerModalStyle,
    height,
    enableCloseIcon = true,
    onModalHide
  } = props;

  const [isKeyboardVisible, setKeyboardVisible] = useState(true);
  const styles = getStyles(theme, height, isKeyboardVisible, enableCloseIcon);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onDismiss}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      animationOutTiming={100}
      backdropColor={Colors.Black}
      backdropOpacity={0.8}
      onModalHide={onModalHide}
      style={[styles.containerStyle, conatinerModalStyle]}>
      <KeyboardAvoidView style={styles.container}>
        <AppTouchable onPress={onDismiss} style={styles.dashViewWrapper}>
          <View style={styles.dashView} />
        </AppTouchable>
        <View style={styles.headingWrapper}>
          <View style={styles.contentWrapper}>
            <AppText
              variant={enableCloseIcon ? 'heading1' : 'heading2'}
              style={styles.titleText}>
              {title}
            </AppText>
            {subTitle ? (
              <AppText variant="body1" style={styles.subTitleText}>
                {subTitle}
              </AppText>
            ) : null}
          </View>
          {enableCloseIcon && (
            <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
              <IconClose />
            </AppTouchable>
          )}
        </View>
        {children}
      </KeyboardAvoidView>
    </Modal>
  );
};
const getStyles = (
  theme: AppTheme,
  height,
  isKeyboardVisible,
  enableCloseIcon,
) =>
  StyleSheet.create({
    container: {
      flex: Platform.OS === 'ios' ? 1 : 0,
      height: height,
    },
    containerStyle: {
      height: isKeyboardVisible ? height : 'auto',
      width: '100%',
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 10 : 0,
      left: 0,
      backgroundColor: theme.colors.modalBackColor,
      padding: hp(25),
      borderTopLeftRadius: hp(30),
      borderTopRightRadius: hp(30),
      marginHorizontal: 0,
      marginBottom: isKeyboardVisible ? 0 : 5,
    },
    headingWrapper: {
      flexDirection: 'row',
      width: '100%',
      // alignItems: 'center',
      marginBottom: hp(20),
    },
    contentWrapper: {
      width: enableCloseIcon ? '80%' : '100%',
    },
    closeIconWrapper: {
      width: '20%',
      alignItems: 'center',
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginBottom: hp(3),
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
    dashViewWrapper: {
      alignItems: 'center',
    },
    dashView: {
      height: hp(3),
      width: hp(60),
      marginBottom: hp(30),
      backgroundColor: theme.colors.headingColor,
    },
  });
export default ModalContainer;
