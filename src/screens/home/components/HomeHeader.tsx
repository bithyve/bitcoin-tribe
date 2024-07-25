import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import UserAvatar from 'src/components/UserAvatar';
import { hp, wp } from 'src/constants/responsive';

import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconScanner from 'src/assets/images/icon_scanner.svg';
import IconNotification from 'src/assets/images/icon_notifications.svg';
import IconWrapper from 'src/components/IconWrapper';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type HomeHeaderProps = {
  profile: string;
  username: string;
  balance: string;
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
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <AppTouchable onPress={onPressProfile} style={styles.contentWrapper}>
        <View style={styles.contentWrapper}>
          <UserAvatar size={50} imageSource={profile} />
          <View style={styles.userDetailsWrapper}>
            <AppText variant="body1" style={styles.usernameText}>
              {username}
            </AppText>
            <View style={styles.balanceWrapper}>
              <IconBitcoin />
              <AppText variant="body5" style={styles.balanceText}>
                &nbsp;{numberWithCommas(balance)} sats
              </AppText>
            </View>
          </View>
        </View>
      </AppTouchable>
      <View style={styles.iconWrapper}>
        <IconWrapper onPress={onPressScanner}>
          <IconScanner />
        </IconWrapper>
        <IconWrapper onPress={onPressNotification}>
          <IconNotification />
        </IconWrapper>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '68%',
      alignItems: 'center',
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
      marginTop: hp(2),
    },
    iconWrapper: {
      width: '32%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    iconTouchableArea: {
      height: '60%',
    },
  });
export default HomeHeader;
