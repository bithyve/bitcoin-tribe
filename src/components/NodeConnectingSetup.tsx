import React, { useContext, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Modal, Portal, useTheme } from 'react-native-paper';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import TapInfoIcon from 'src/assets/images/tapInfoIcon.svg';
import { AppContext } from 'src/contexts/AppContext';
import AppTouchable from './AppTouchable';
import AppText from './AppText';
import GradientView from './GradientView';
import Colors from 'src/theme/Colors';

const NodeConnectingSetup = ({modalVisible, setModalVisible}) => {
  const { isNodeInitInProgress } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { common, node } = translations;
  const hasNotch = DeviceInfo.hasNotch();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, hasNotch);

  return isNodeInitInProgress ? (
    <>
      <AppTouchable style={styles.banner} onPress={() => setModalVisible(true)}>
        <GradientView
          style={styles.container}
          colors={[
            Colors.BrandeisBlue,
            Colors.BrandeisBlue,
            Colors.ElectricViolet,
          ]}>
          <View style={styles.titleWrapper}>
            <AppText variant="body2" style={styles.text}>
              {node.connectingNode}
            </AppText>
          </View>
          <View style={styles.tapViewWrapper}>
            <AppText variant="body2" style={styles.text}>
              {common.tapToInfo}
            </AppText>
            <TapInfoIcon />
          </View>
        </GradientView>
      </AppTouchable>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.tooltipContainer]}>
          <AppText variant="caption" style={styles.tooltipText}>
            {node.connectingNodeInfo}
          </AppText>
        </Modal>
      </Portal>
    </>
  ) : null;
};

const getStyles = (theme: AppTheme, hasNotch) =>
  StyleSheet.create({
    banner: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width:windowWidth,
      height:hp(25)
    },
    container: {
      flex: Platform.OS === 'ios' ? 1 : 0,
      flexDirection: 'row',
      paddingVertical: windowHeight > 820 ? hp(3) : 0,
      paddingHorizontal: hp(10),
    },
    text: {
      color: 'white',
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    titleWrapper: {
      width: '74%',
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

export default NodeConnectingSetup;
