import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from 'react-native-paper';
import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { windowHeight } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';

export const CommunityServerBanner = () => {
  const { communityStatus,setCommunityStatus} =
    useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);

  const status = useMemo(()=>{
    switch (communityStatus) {
      case "connected": {
        setTimeout(() => {
          setCommunityStatus(null);
        }, 1000);
        return {
          message:"Connected to community server",
          color:Colors.GOGreen
        }
      };
      case "offline": return {
        message:"Community server offline",
        color:Colors.FireOpal
      };
      case "online":{
        setTimeout(() => {
          setCommunityStatus(null);
        }, 1000);
        return {
          message:"Community server online",
          color:Colors.GOGreen
        }};
    }
  },[communityStatus])

  const onPress = React.useCallback(() => {
    console.log('Pressed');
  }, []);

  return  communityStatus? (
    <AppTouchable style={[styles.errorContainer, status?.color &&{backgroundColor:status.color}]} onPress={onPress}>
      <AppText style={styles.text}>{status.message}</AppText>
    </AppTouchable>
  ) : null;
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    onlineContainer: {
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
      zIndex: 1000,
      alignItems: 'center',
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
      zIndex: 1000, // Ensures the banner is above everything
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
