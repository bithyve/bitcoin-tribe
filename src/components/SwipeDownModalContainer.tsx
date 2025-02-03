import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import AppTouchable from './AppTouchable';
import AppText from './AppText';
import IconClose from 'src/assets/images/icon_close.svg';
import { hp } from 'src/constants/responsive';
type ModalContainerProps = {
  title: string;
  subTitle?: string;
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
  height?: string;
  enableCloseIcon?: boolean;
};
const SwipeDownModalContainer = (props: ModalContainerProps) => {
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
  } = props;
  const styles = getStyles(theme, enableCloseIcon);
  return (
    <Modal
      isVisible={visible}
      swipeDirection={['down']}
      onSwipeComplete={onDismiss}
      onBackdropPress={onDismiss}
      style={styles.modal}>
      <View style={styles.containerStyle}>
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
      </View>
    </Modal>
  );
};
const getStyles = (theme: AppTheme, enableCloseIcon) =>
  StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    containerStyle: {
      height: 'auto',
      width: '100%',
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 10 : 0,
      left: 0,
      backgroundColor: theme.colors.modalBackColor,
      padding: hp(25),
      borderTopLeftRadius: hp(30),
      borderTopRightRadius: hp(30),
      marginHorizontal: 0,
      marginBottom: 5,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 10,
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
    headingWrapper: {
      flexDirection: 'row',
      width: '100%',
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
  });
export default SwipeDownModalContainer;
