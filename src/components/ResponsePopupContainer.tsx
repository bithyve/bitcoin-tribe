import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Modal from 'react-native-modal';

import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import { AppTheme } from 'src/theme';

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
      // backgroundColor: theme.colors.primaryBackground,
    },
    modalContainer: {
      width: '100%',
      padding: 20,
      backgroundColor: backColor,
      borderRadius: 30,
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
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default ResponsePopupContainer;
