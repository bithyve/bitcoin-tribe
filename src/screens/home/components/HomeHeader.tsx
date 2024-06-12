import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';

import AppText from 'src/components/AppText';
import UserAvatar from 'src/components/UserAvatar';
import { wp } from 'src/constants/responsive';

import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import IconScanner from 'src/assets/images/icon_scanner.svg';
import IconNotification from 'src/assets/images/icon_notifications.svg';
import AppTouchable from 'src/components/AppTouchable';

type HomeHeaderProps = {
  profile: any;
  username: string;
  balance: any;
  onPressProfile: () => void;
  onPressScanner: () => void;
  onPressNotification: () => void;
};
function HomeHeader(props: HomeHeaderProps) {
  const {
    profile,
    username,
    balance,
    onPressScanner,
    onPressNotification,
    onPressProfile,
  } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <AppTouchable onPress={onPressProfile} style={styles.contentWrapper}>
        <View style={styles.contentWrapper}>
          <UserAvatar size={50} imageSource={profile} />
          <View style={styles.userDetailsWrapper}>
            <AppText
              variant="body1"
              style={styles.usernameText}
              testID="text_username">
              {username}
            </AppText>
            <View style={styles.balanceWrapper}>
              <IconBitcoin />
              <AppText
                variant="body5"
                style={styles.balanceText}
                testID="text_balance">
                &nbsp;&nbsp;{balance}
              </AppText>
            </View>
          </View>
        </View>
      </AppTouchable>
      <View style={styles.iconWrapper}>
        <AppTouchable onPress={onPressScanner}>
          <IconScanner />
        </AppTouchable>
        <AppTouchable onPress={onPressNotification}>
          <IconNotification />
        </AppTouchable>
      </View>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '80%',
    },
    userDetailsWrapper: {
      marginLeft: wp(10),
    },
    usernameText: {
      color: theme.colors.accent3,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceText: {
      color: theme.colors.bodyColor,
    },
    iconWrapper: {
      width: '20%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
export default HomeHeader;
