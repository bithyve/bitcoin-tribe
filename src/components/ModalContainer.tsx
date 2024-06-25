import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Modal, Portal, useTheme } from 'react-native-paper';

import IconClose from 'src/assets/images/icon_close.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';

type ModalContainerProps = {
  title: string;
  subTitle?: string;
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
  conatinerModalStyle?: StyleProp<ViewStyle>;
};

const ModalContainer = (props: ModalContainerProps) => {
  const theme: AppTheme = useTheme();
  const { visible, onDismiss, children, title, subTitle, conatinerModalStyle } =
    props;
  const styles = getStyles(theme);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.containerStyle, conatinerModalStyle]}>
        <View>
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
        </View>
      </Modal>
    </Portal>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerStyle: {
      width: '100%',
      position: 'absolute',
      backgroundColor: theme.colors.cardBackground,
      padding: hp(25),
      borderRadius: 10,
      bottom: 2,
      alignSelf: 'flex-end',
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
