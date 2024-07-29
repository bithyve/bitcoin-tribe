import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';

import ConnectIcon from 'src/assets/images/icon_connect.svg';
import DisConnectIcon from 'src/assets/images/icon_disconnect.svg';
import DeleteIcon from 'src/assets/images/icon_close.svg';

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
      <View style={styles.wrapper1}>
        <View style={styles.ipAddressWrapper}>
          <AppText variant="body2" style={styles.labelStyle}>
            {settings.ipAddress}
          </AppText>
          <AppText variant="body1" style={styles.labelStyle}>
            {ipAddress}
          </AppText>
        </View>
        <View>
          <AppText variant="body2" style={styles.labelStyle}>
            {settings.portNumber}
          </AppText>
          <AppText variant="body1" style={styles.labelStyle}>
            {portNumber}
          </AppText>
        </View>
      </View>
      <View style={styles.wrapper2}>
        <View style={styles.buttonWrapper1}>
          {status ? <ConnectIcon /> : <DisConnectIcon />}
          <AppText variant="smallCTA" style={styles.buttonTextStyle}>
            {status ? common.connect : common.disconnect}
          </AppText>
        </View>
        <View style={styles.buttonWrapper2}>
          <DeleteIcon />
          <AppText variant="smallCTA" style={styles.buttonTextStyle}>
            {common.delete}
          </AppText>
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, status) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.cardBackground,
      alignItems: 'center',
      padding: hp(15),
      borderRadius: 10,
      marginTop: hp(10),
      marginBottom: status ? hp(35) : hp(5),
      // need to work
      shadowColor: theme.colors.cardShadowColor,
      shadowRadius: 1,
      shadowOpacity: 0.2,
      elevation: 0.5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
    },
    labelStyle: {
      color: theme.colors.headingColor,
    },
    wrapper1: {
      width: '45%',
    },
    wrapper2: {
      width: '55%',
      flexDirection: 'row',
      marginTop: hp(20),
    },
    buttonTextStyle: {
      color: theme.colors.accent1,
    },
    buttonWrapper1: {
      width: '65%',
      alignItems: 'center',
      borderRightColor: theme.colors.borderColor,
      borderRightWidth: 0.5,
      paddingRight: hp(2),
    },
    buttonWrapper2: {
      width: '35%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: hp(10),
    },
    ipAddressWrapper: {
      marginBottom: hp(10),
    },
  });
export default NodeDetailsCard;
