import React, { useContext, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Modal, Portal, useTheme } from 'react-native-paper';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';
import { AppContext } from 'src/contexts/AppContext';
import AppTouchable from './AppTouchable';
import AppText from './AppText';

const BackupAlertBanner = () => {
  const { isBackupInProgress } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const [visible, setVisible] = useState(false);

  return isBackupInProgress ? (
    <>
      <AppTouchable style={styles.banner} onPress={() => setVisible(true)}>
        <View style={styles.titleWrapper}>
          <AppText variant="body1" style={styles.text}>
            {common.backupInProgress}
          </AppText>
        </View>
        <View style={styles.tapViewWrapper}>
          <AppText variant="body1" style={styles.text}>
            {common.tapToInfo}
          </AppText>
          <TapInfoIcon />
        </View>
      </AppTouchable>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.tooltipContainer]}>
          <AppText variant="caption" style={styles.tooltipText}>
            {common.backupInProgressMsg}
          </AppText>
        </Modal>
      </Portal>
    </>
  ) : null;
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      position: Platform.OS === 'ios' ? 'absolute' : 'relative',
      top: hasNotch
        ? 40
        : Platform.OS === 'ios' && windowHeight > 820
        ? 50
        : Platform.OS === 'android'
        ? 35
        : 16,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.backupAlertBackColor,
      zIndex: 1000,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: windowHeight > 820 ? hp(3) : 0,
      paddingHorizontal: hp(10),
    },
    text: {
      color: 'white',
      fontWeight: '500',
    },
    titleWrapper: {
      width: '72%',
    },
    tapViewWrapper: {
      width: '28%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: theme.colors.modalBackColor,
      padding: 12,
      borderRadius: 8,
      width: 270,
      alignItems: 'center',
      alignSelf: 'flex-end',
      right: 15,
      top: hasNotch
        ? 50
        : Platform.OS === 'ios' && windowHeight > 820
        ? 28
        : Platform.OS === 'android'
        ? 68
        : 25,
    },
    tooltipText: {
      color: theme.colors.headingColor,
      fontSize: 14,
    },
  });

export default BackupAlertBanner;
