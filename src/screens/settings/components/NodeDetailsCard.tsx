import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';

import ConnectIcon from 'src/assets/images/connected.svg';
import DisConnectIcon from 'src/assets/images/disconnected.svg';
import ConnectDeleteIcon from 'src/assets/images/connectedDelete.svg';
import DisConnectDeleteIcon from 'src/assets/images/disconnectDelete.svg';
import GradientView from 'src/components/GradientView';

type nodeDetailsCardProps = {
  ipAddress: string;
  portNumber: string;
  status: boolean;
};
function NodeDetailsCard(props: nodeDetailsCardProps) {
  const { ipAddress, portNumber, status } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, status);
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;

  return (
    <AppTouchable style={styles.container}>
      <GradientView
        style={styles.wrapper1}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.ipAddressWrapper}>
          <AppText variant="body2" style={styles.labelStyle}>
            {settings.ipAddress}
          </AppText>
          <AppText variant="body1" style={styles.valueStyle}>
            {ipAddress}
          </AppText>
        </View>
        <View style={styles.portWrapper}>
          <AppText variant="body2" style={styles.labelStyle}>
            {settings.portNumber}
          </AppText>
          <AppText variant="body1" style={styles.valueStyle}>
            {portNumber}
          </AppText>
        </View>
      </GradientView>
      <View style={styles.wrapper2}>
        <View style={styles.buttonWrapper1}>
          {status ? <ConnectIcon /> : <DisConnectIcon />}
        </View>
        <View style={styles.buttonWrapper2}>
          {status ? <ConnectDeleteIcon /> : <DisConnectDeleteIcon />}
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, status) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      // padding: hp(10),
      justifyContent: 'space-around',
      borderRadius: 10,
      marginTop: hp(10),
      marginBottom: status ? hp(35) : hp(5),
    },
    labelStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
    valueStyle: {
      color: theme.colors.headingColor,
    },
    wrapper1: {
      flexDirection: 'row',
      width: '60%',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      padding: hp(15),
      borderRadius: 15,
    },
    wrapper2: {
      width: '40%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    buttonTextStyle: {
      color: theme.colors.accent1,
    },
    buttonWrapper1: {
      width: '45%',
      alignItems: 'center',
    },
    buttonWrapper2: {
      width: '48%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: hp(10),
    },
    ipAddressWrapper: {
      width: '50%',
    },
    portWrapper: {
      width: '50%',
    },
  });
export default NodeDetailsCard;
