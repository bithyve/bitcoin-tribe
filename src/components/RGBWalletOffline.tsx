import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';
import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import AppType from 'src/models/enums/AppType';
import { AppTheme } from 'src/theme';
import { windowHeight } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { WalletOnlineStatus } from 'src/models/interfaces/RGBWallet';
import Toast from './Toast';

const RGBWalletStatus = () => {
  const { isWalletOnline, appType, setIsWalletOnline } = useContext(AppContext);
  const { translations, formatString } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const makeWalletOnline = useMutation(ApiHandler.makeWalletOnline);
  const navigation = useNavigation();
  const [retryAttempt, setretryAttempt] = useState(0);

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
          makeWalletOnline.mutate();
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

  const getRetryMessage = useMemo(() => {
    return retryAttempt === 0
      ? common.gettingRGBWalletOnline
      : formatString(common.gettingRGBWalletOnlineAttempt, retryAttempt);
  }, [retryAttempt]);

  useEffect(() => {
    if (appType && makeWalletOnline.data?.status !== undefined) {
      setIsWalletOnline(
        makeWalletOnline.data?.status
          ? WalletOnlineStatus.Online
          : WalletOnlineStatus.Error,
      );
      if(makeWalletOnline.data?.error) {
        Toast(makeWalletOnline.data?.error, true);
      }
    }
  }, [makeWalletOnline.data?.status, appType]);

  const msg = useMemo(() => {
    return appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
      ? common.rgbNodeOffline
      : common.rgbWalletOffline;
  }, [appType]);

  return isWalletOnline === WalletOnlineStatus.Error ? (
    <AppTouchable style={styles.errorContainer} onPress={onPress}>
      <AppText style={styles.text}>{msg}</AppText>
    </AppTouchable>
  ) : isWalletOnline === WalletOnlineStatus.InProgress ? (
    <AppTouchable style={styles.container} disabled>
      <AppText style={styles.text}>{getRetryMessage}</AppText>
    </AppTouchable>
  ) : null;
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    errorContainer: {
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
      backgroundColor: Colors.FireOpal,
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
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
    },
  });

export default RGBWalletStatus;
