import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import SendEnterAddress from './SendEnterAddress';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppTouchable from 'src/components/AppTouchable';
import IconClose from 'src/assets/images/icon_close.svg';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

function SendAddressModal({ visible, onDismiss }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          enabled
          keyboardVerticalOffset={Platform.select({ ios: 202, android: 500 })}
          style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <AppTouchable onPress={onDismiss} style={styles.closeIconWrapper}>
              <IconClose />
            </AppTouchable>
            <View style={styles.headingWrapper}>
              <AppText variant="heading1" style={styles.titleText}>
                {sendScreen.enterSendAddress}
              </AppText>
              <AppText variant="body1" style={styles.subTitleText}>
                {sendScreen.enterSendAdrsSubTitle}
              </AppText>
            </View>
            <SendEnterAddress />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      paddingHorizontal: wp(5),
      flexDirection: 'column-reverse',
    },
    modalWrapper: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      padding: wp(20),
    },
    modalBox: {
      width: '100%',
      height: '50%',
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
export default SendAddressModal;
