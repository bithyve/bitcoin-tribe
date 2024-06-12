import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, useTheme } from 'react-native-paper';

import IconClose from 'src/assets/images/icon_close.svg';
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
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.containerStyle}>
      <View>
        <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
          <IconClose />
        </AppTouchable>
        <View>
          <AppText variant="heading1" testID="text_modalTitle">
            {title}
          </AppText>
          <AppText variant="body1" testID="text_modalSubTitle">
            {subTitle}
          </AppText>
        </View>
        {children}
      </View>
    </Modal>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    containerStyle: {
      backgroundColor: theme.colors.cardBackground,
      padding: 20,
      margin: 10,
      zIndex: 999,
      position: 'absolute',
      bottom: 100,
    },
    closeIconWrapper: {
      alignSelf: 'flex-end',
    },
  });
export default ModalContainer;
