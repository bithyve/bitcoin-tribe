import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useMutation } from 'react-query';
import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import AppType from 'src/models/enums/AppType';
import { AppTheme } from 'src/theme';
import { windowHeight, wp } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { WalletOnlineStatus } from 'src/models/interfaces/RGBWallet';
import Toast from './Toast';
import { Modal, Portal, useTheme } from 'react-native-paper';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';

const RGBWalletStatus = () => {
  const {
    isWalletOnline,
    appType,
    setIsWalletOnline,
    reSyncWallet,
    reSyncingWallet,
  } = useContext(AppContext);
  const { translations, formatString } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const makeWalletOnline = useMutation(ApiHandler.makeWalletOnline);
  const navigation = useNavigation();
  const [retryAttempt, setretryAttempt] = useState(0);
  const [walletWentOnline, setWalletWentOnline] = useState(false);
  const [visible, setVisible] = useState(false);

  const onPress = React.useCallback(() => {
    if (isWalletOnline === WalletOnlineStatus.Error) {
      if (
        appType === AppType.NODE_CONNECT ||
        appType === AppType.SUPPORTED_RLN
      ) {
        navigation.navigate(NavigationRoutes.VIEWNODEINFO);
      } else {
        setIsWalletOnline(WalletOnlineStatus.InProgress);
        setTimeout(() => {
          setretryAttempt(retryAttempt + 1);
          makeWalletOnline.mutate(30);
        }, 1000);
      }
    }
  }, [
    isWalletOnline,
    appType,
    navigation,
    setIsWalletOnline,
    makeWalletOnline,
    retryAttempt,
  ]);

  useEffect(() => {
    if (reSyncingWallet) {
      resyncWallet();
    }
  }, [reSyncingWallet]);

  const resyncWallet = async () => {
    try {
      reSyncWallet(false);
      setIsWalletOnline(WalletOnlineStatus.InProgress);
      setTimeout(() => {
        setretryAttempt(retryAttempt + 1);
        makeWalletOnline.mutate(0);
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isWalletOnline === WalletOnlineStatus.Online) {
      setWalletWentOnline(true);
      setretryAttempt(0);
      setTimeout(() => {
        setWalletWentOnline(false);
      }, 1500);
    }
  }, [isWalletOnline]);

  const getRetryMessage = useMemo(() => {
    return common.gettingRGBWalletOnline;
  }, [retryAttempt]);

  useEffect(() => {
    if (appType && makeWalletOnline.data?.status !== undefined) {
      setIsWalletOnline(
        makeWalletOnline.data?.status
          ? WalletOnlineStatus.Online
          : WalletOnlineStatus.Error,
      );
      if (makeWalletOnline.data?.error) {
        Toast(makeWalletOnline.data?.error, true);
      }
    }
  }, [makeWalletOnline.data?.status, appType]);

  const msg = useMemo(() => {
    return appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
      ? common.rgbNodeOffline
      : common.rgbWalletOffline;
  }, [appType]);

  const tapView = useMemo(() => {
    return (
      <AppTouchable onPress={() => setVisible(true)} style={styles.tapViewWrapper}>
        <AppText variant="body2" style={styles.text}>
          {common.tapToInfo}
        </AppText>
        <TapInfoIcon />
      </AppTouchable>
    );
  }, [common.tapToInfo]);

  return (
    <View style={styles.container}>
      {isWalletOnline === WalletOnlineStatus.Error ? (
        <AppTouchable style={styles.errorContainer} onPress={onPress}>
          <AppText style={styles.text}>{msg}</AppText>
          {tapView}
        </AppTouchable>
      ) : isWalletOnline === WalletOnlineStatus.InProgress ? (
        <AppTouchable style={styles.inProgressContainer} disabled>
          <AppText style={styles.text}>{getRetryMessage}</AppText>
          {tapView}
        </AppTouchable>
      ) : walletWentOnline ? (
        <AppTouchable style={styles.onlineContainer} disabled>
          <AppText style={styles.text}>{common.walletWentOnline}</AppText>
        </AppTouchable>
      ) : null}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.tooltipContainer]}>
          <AppText variant="caption" style={styles.tooltipText}>
          {isWalletOnline === WalletOnlineStatus.InProgress ? common.gettingRGBWalletOnlineMessage : formatString(common.gettingRGBWalletOnlineAttempt, { attempt: retryAttempt })}
          </AppText>
        </Modal>
      </Portal>
    </View>
  );
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    onlineContainer: {
      backgroundColor: Colors.GOGreen,
      zIndex: 1000,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(16),
    },
    errorContainer: {
      backgroundColor: Colors.FireOpal,
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(16),
      flexDirection: 'row',
    },
    inProgressContainer: {
      backgroundColor: Colors.SelectiveYellow,
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(16),
      flexDirection: 'row',
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
      backgroundColor: Colors.SelectiveYellow,
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
    },
    tapViewWrapper: {
      width: '26%',
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

export default RGBWalletStatus;
