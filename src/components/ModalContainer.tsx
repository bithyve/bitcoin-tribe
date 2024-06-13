import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Provider, useTheme } from 'react-native-paper';

import IconClose from 'src/assets/images/icon_close.svg';
import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';

type ModalContainerProps = {
  title: string;
  subTitle: string;
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
};

const ModalContainer = (props: ModalContainerProps) => {
  const theme = useTheme();
  const { visible, onDismiss, children, title, subTitle } = props;
  const styles = getStyles(theme);
  return (
    // <Provider>
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.containerStyle}>
        <View>
          <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
            <IconClose />
          </AppTouchable>
          <View style={styles.headingWrapper}>
            <AppText
              variant="heading1"
              testID="text_modalTitle"
              style={styles.titleText}>
              {title}
            </AppText>
            <AppText
              variant="body1"
              testID="text_modalSubTitle"
              style={styles.subTitleText}>
              {subTitle}
            </AppText>
          </View>
          {children}
        </View>
      </Modal>
    </Portal>
    // </Provider>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    containerStyle: {
      position: 'absolute',
      backgroundColor: theme.colors.cardBackground,
      padding: 20,
      borderRadius: 10,
      bottom: 2,
      alignSelf: 'flex-end',
    },
    closeIconWrapper: {
      alignSelf: 'flex-end',
    },
    headingWrapper: {
      marginVertical: 20,
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.bodyColor,
    },
  });
export default ModalContainer;
