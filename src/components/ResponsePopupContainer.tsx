import React, { useState, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Modal from 'react-native-modal';

import IconClose from 'src/assets/images/icon_close.svg';
import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';

type popupContainerProps = {
  title: string;
  subTitle?: string;
  visible: boolean;
  enableClose?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
  height?: string;
  backColor: string;
  borderColor: string;
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
  } = props;

  const styles = getStyles(theme, backColor, borderColor);

  return (
    <View style={styles.container}>
      <Modal
        isVisible={visible}
        onBackdropPress={onDismiss}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropColor={theme.colors.primaryBackground}
        backdropOpacity={0.8}
        style={[styles.modalBackground, conatinerModalStyle]}>
        <View style={styles.modalContainer}>
          <View style={styles.headingWrapper}>
            <View style={styles.contentWrapper}>
              <AppText variant="heading1" style={styles.titleText}>
                {title}
              </AppText>
              {subTitle ? (
                <AppText variant="body1" style={styles.subTitleText}>
                  {subTitle}
                </AppText>
              ) : null}
            </View>
            {enableClose && (
              <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
                <IconClose />
              </AppTouchable>
            )}
          </View>
          {children}
        </View>
      </Modal>
    </View>
  );
};
const getStyles = (theme: AppTheme, backColor, borderColor) =>
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
      backgroundColor: theme.colors.primaryBackground,
    },
    modalContainer: {
      width: '100%',
      padding: 20,
      backgroundColor: backColor,
      borderRadius: 10,
      alignItems: 'center',
      borderColor: borderColor,
      borderWidth: 1,
    },
    headingWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: hp(50),
    },
    contentWrapper: {
      width: '80%',
    },
    closeIconWrapper: {
      width: '20%',
      alignItems: 'center',
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default ResponsePopupContainer;