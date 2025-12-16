import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { AppContext } from 'src/contexts/AppContext';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';

export const CommunityServerBanner = ({modalVisible,setModalVisible}) => {
  const { communityStatus, setCommunityStatus } = useContext(AppContext);
   const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);

  const status = useMemo(() => {
    switch (communityStatus) {
      case 'connected': {
        setTimeout(() => {
          setCommunityStatus(null);
        }, 1000);
        return {
          message: common.connectedToCommunityServer,
          type: 'success',
        };
      }
      case 'connecting':
        return {
          message: common.connectingToCommunityServer,
          type: 'warning',
        };
      case 'offline':
        return {
          message: common.communityServerOffline,
          type: 'error',
        };
      case 'online': {
        setTimeout(() => {
          setCommunityStatus(null);
        }, 1000);
        return {
          message: common.communityServerOnline,
          type: 'success',
        };
      }
      default:
        return null;
    }
  }, [communityStatus, common]);

  const onPress = React.useCallback(() => {
    console.log('Pressed');
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

  return (
    <View>
      {communityStatus && status ? (
        status.type == 'error' ? (
          <AppTouchable style={[styles.errorContainer]} onPress={onPress}>
            <AppText style={styles.text}>{status.message}</AppText>
            {tapView}
          </AppTouchable>
        ) : status.type == 'success' ? (
          <AppTouchable style={[styles.successContainer]} onPress={onPress}>
            <AppText style={styles.text}>{status.message}</AppText>
          </AppTouchable>
        ) : status.type == 'warning' ? (
          <AppTouchable style={[styles.warningContainer]} onPress={onPress}>
            <AppText style={styles.text}>{status.message}</AppText>
          </AppTouchable>
        ) : null
      ) : null}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.tooltipContainer]}>
          <AppText variant="caption" style={styles.tooltipText}>
            {common.communityServerUnavailable}
          </AppText>
        </Modal>
      </Portal>
    </View>
  );
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    successContainer: {
      alignItems: 'flex-start',
      paddingHorizontal: wp(16),
      backgroundColor: Colors.GOGreen,
      width:windowWidth,
      height:hp(25),
      justifyContent:"center"
    },
    errorContainer: {
      backgroundColor: Colors.FireOpal,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: windowWidth,
      paddingHorizontal: wp(16),
      height:hp(25),
      alignItems:"center"
    },
    warningContainer: {
      alignItems: 'flex-start',
      paddingHorizontal: wp(16),
      backgroundColor: '#FFA500', // Orange color for warning/connecting state
      width:windowWidth,
      height:hp(25),
      justifyContent:"center"
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
