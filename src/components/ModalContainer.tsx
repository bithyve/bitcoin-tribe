import React,{useState, useEffect} from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Modal from 'react-native-modal'

import IconClose from 'src/assets/images/icon_close.svg';
import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import KeyboardAvoidView from './KeyboardAvoidView';

type ModalContainerProps = {
  title: string;
  subTitle?: string;
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
  height?: string;
};

const ModalContainer = (props: ModalContainerProps) => {
  const theme: AppTheme = useTheme();
  const { visible, onDismiss, children, title, subTitle, conatinerModalStyle, height } =
    props;
    const [isKeyboardVisible, setKeyboardVisible] = useState(true);

  const styles = getStyles(theme, height, isKeyboardVisible);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
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
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      backdropColor={theme.colors.cardBackground}
      backdropOpacity={0.8}
      style={[styles.containerStyle, conatinerModalStyle]}>
        <KeyboardAvoidView style={styles.container}>
        <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
          <IconClose />
        </AppTouchable>
        <View style={styles.headingWrapper}>
          <AppText variant="heading1" style={styles.titleText}>
            {title}
          </AppText>
          {subTitle ? (
            <AppText variant="body1" style={styles.subTitleText}>
              {subTitle}
            </AppText>
          ) : null}
        </View>
        {children}
        </KeyboardAvoidView>
    </Modal>
  );
};
const getStyles = (theme: AppTheme, height, isKeyboardVisible) =>
  StyleSheet.create({
    container:{
      flex: 1
    },
    containerStyle: {
      height: isKeyboardVisible ? height : 'auto',
      width: '95%',
      position: 'absolute',
      bottom: 0,
      backgroundColor: theme.colors.cardBackground,
      padding: hp(25),
      borderRadius: 10,
      marginHorizontal: 10,
      shadowColor: theme.colors.shodowColor,
      shadowRadius: 3,
      shadowOpacity: 0.2,
      elevation: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    closeIconWrapper: {
      alignSelf: 'flex-end',
    },
    headingWrapper: {
      marginTop: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.bodyColor,
    },
  });
export default ModalContainer;
