import React, { useContext, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { windowHeight, wp } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';

export const AppImageBackupStatusType = {
  loading: 'loading',
  success: 'success',
  error: 'error',
  idle: 'idle',
} as const;

export const AppImageBackupBanner = () => {
  const { appImageBackupStatus, setAppImageBackupStatus } =
    useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const [visible, setVisible] = useState(false);

  const status = useMemo(() => {
    switch (appImageBackupStatus) {
      case AppImageBackupStatusType.success: {
        setTimeout(() => {
          setAppImageBackupStatus(AppImageBackupStatusType.idle);
        }, 1000);
        return {
          message: common.appImageBackupSuccess,
          type: AppImageBackupStatusType.success,
          color: Colors.GOGreen
        };
      }
      case AppImageBackupStatusType.error:
        return {
          message: common.appImageBackupFailure,
          type: AppImageBackupStatusType.error,
          color:Colors.FireOpal,
        };
      case AppImageBackupStatusType.loading: {
        return {
          message: common.appImageBackupInProgress,
          type: AppImageBackupStatusType.success,
          color:Colors.SelectiveYellow
        };
      }
      default:
        return {
          message: '',
          type: AppImageBackupStatusType.success,
          color: Colors.GOGreen
        };
    }
  }, [appImageBackupStatus, common]);

  const onPress = React.useCallback(() => {
    ApiHandler.backupAppImage(setAppImageBackupStatus,{all:true})
  }, []);

  const tapView = useMemo(() => {
    return (
      <AppTouchable
        onPress={() => setVisible(true)}
        style={styles.tapViewWrapper}>
        <TapInfoIcon />
      </AppTouchable>
    );
  }, [common.tapToInfo]);

  if (appImageBackupStatus == AppImageBackupStatusType.idle) return null;

  return (
    <View>
      <AppTouchable
        style={[
          status.type == AppImageBackupStatusType.error
            ? styles.errorContainer
            : styles.successContainer,
            {backgroundColor:status.color}
        ]}
        onPress={onPress}>
        <AppText style={styles.text}>{status.message}</AppText>
        {status.type == AppImageBackupStatusType.error && tapView}
      </AppTouchable>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.tooltipContainer]}>
          <AppText variant="caption" style={styles.tooltipText}>
            {common.appImageBackupFailureTooltip}
          </AppText>
        </Modal>
      </Portal>
    </View>
  );
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    successContainer: {
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
      zIndex: 1000,
      alignItems: 'flex-start',
      paddingHorizontal: wp(16),
    },
    errorContainer: {
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
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: wp(16),
    },
    container: {
      position: Platform.OS === 'ios' ? 'absolute' : 'relative',
      top: hasNotch
        ? 40
        : Platform.OS === 'ios' && windowHeight > 820
        ? 50
        : Platform.OS === 'android'
        ? 40
        : 16,
      left: 0,
      right: 0,
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    tapViewWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
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
