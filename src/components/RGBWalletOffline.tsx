import React, { useContext, useMemo } from 'react';
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

const RGBWalletStatus = () => {
  const { isWalletOnline, appType, setIsWalletOnline } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const navigation = useNavigation();

  const onPress = () => {
    if (!isWalletOnline) {
      if (appType === AppType.NODE_CONNECT) {
        navigation.navigate(NavigationRoutes.VIEWNODEINFO);
      } else {
        refreshRgbWallet.mutate();
      }
    }
  };

  const msg = useMemo(() => {
    return appType === AppType.NODE_CONNECT
      ? common.rgbNodeOffline
      : common.rgbWalletOffline;
  }, [appType]);

  return isWalletOnline === false ? (
    <AppTouchable style={styles.errorContainer} onPress={onPress}>
      <AppText style={styles.text}>{msg}</AppText>
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
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default RGBWalletStatus;
