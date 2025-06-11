import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Modal from 'react-native-modal';

import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import { AppTheme } from 'src/theme';
import Colors from 'src/theme/Colors';

type popupContainerProps = {
  title?: string;
  subTitle?: string;
  visible: boolean;
  enableClose?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
  height?: string;
  backColor: string;
  borderColor: string;
  width?: string;
  animationIn?:
    | 'fadeIn'
    | 'fadeOut'
    | 'bounce'
    | 'flash'
    | 'jello'
    | 'pulse'
    | 'rotate'
    | 'rubberBand'
    | 'shake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'bounceIn'
    | 'bounceInDown'
    | 'bounceInUp'
    | 'bounceInLeft'
    | 'slideInUp';
  animationOut?:
    | 'fadeIn'
    | 'fadeOut'
    | 'bounce'
    | 'flash'
    | 'jello'
    | 'pulse'
    | 'rotate'
    | 'rubberBand'
    | 'shake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'bounceIn'
    | 'bounceInDown'
    | 'bounceInUp'
    | 'bounceInLeft'
    | 'slideOutDown';
};

const ResponsePopupContainer = (props: popupContainerProps) => {
  const theme: AppTheme = useTheme();
  const {
    visible,
    onDismiss,
    enableClose = false,
    children,
    title,
    subTitle,
    conatinerModalStyle,
    backColor,
    borderColor,
    width = '95%',
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
  } = props;

  const styles = getStyles(theme, backColor, borderColor, width);

  return (
    <View style={styles.container}>
      <Modal
        isVisible={visible}
        onBackdropPress={onDismiss}
        animationIn={animationIn}
        animationOut={animationOut}
        backdropColor={Colors.Black}
        backdropOpacity={0.8}
        style={[styles.modalBackground, conatinerModalStyle]}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.headingWrapper,
              { marginBottom: title || subTitle ? hp(50) : 0 },
            ]}>
            <View style={styles.contentWrapper}>
              {title ? (
                <AppText variant="heading1" style={styles.titleText}>
                  {title}
                </AppText>
              ) : null}
              {subTitle ? (
                <AppText variant="body1" style={styles.subTitleText}>
                  {subTitle}
                </AppText>
              ) : null}
            </View>
          </View>
          {children}
        </View>
      </Modal>
    </View>
  );
};
const getStyles = (theme: AppTheme, backColor, borderColor, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: theme.colors.primaryBackground,
    },
    modalContainer: {
      width: width,
      padding: 20,
      backgroundColor: backColor,
      borderRadius: 20,
      alignItems: 'center',
      borderColor: borderColor,
      borderWidth: 1,
    },
    headingWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
    },
    titleText: {
      color: theme.colors.popupText,
    },
    subTitleText: {
      color: theme.colors.popupText,
    },
  });
export default ResponsePopupContainer;
