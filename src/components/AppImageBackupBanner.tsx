import React, { useContext, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Modal, Portal, useTheme } from 'react-native-paper';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';

export const AppImageBackupStatusType = {
  loading: 'loading',
  success: 'success',
  error: 'error',
  idle: 'idle',
} as const;

export const AppImageBackupBanner = ({modalVisible,setModalVisible}) => {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const [isAppImageBackupError] = useMMKVBoolean(Keys.IS_APP_IMAGE_BACKUP_ERROR);

  const onPress = React.useCallback(() => {
    ApiHandler.backupAppImage({all:true})
  }, []);

  const tapView = useMemo(() => {
    return (
      <AppTouchable
        onPress={() => setModalVisible(true)}
        style={styles.tapViewWrapper}>
        <TapInfoIcon />
      </AppTouchable>
    );
  }, [common.tapToInfo]);

  if (!isAppImageBackupError) return null;

  return (
    <View>
      <AppTouchable
        style={styles.errorContainer}
        onPress={onPress}>
        <AppText style={styles.text}>{common.appImageBackupFailure}</AppText>
        {tapView}
      </AppTouchable>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
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
    errorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: windowWidth,
      paddingHorizontal: wp(16),
      backgroundColor:Colors.FireOpal,
      height:hp(25)
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
