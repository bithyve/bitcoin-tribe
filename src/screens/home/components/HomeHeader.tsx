import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import UserAvatar from 'src/components/UserAvatar';
import { wp } from 'src/constants/responsive';

import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import IconScanner from 'src/assets/images/icon_scanner.svg';
import IconNotification from 'src/assets/images/icon_notifications.svg';
import IconWrapper from 'src/components/IconWrapper';

type HomeHeaderProps = {
  profile: any;
  username: string;
  balance: any;
  onPressScanner: any;
  onPressNotification: any;
};
function HomeHeader(props: HomeHeaderProps) {
  const { profile, username, balance, onPressScanner, onPressNotification } =
    props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <UserAvatar size={50} imageSource={profile} />
        <View style={styles.userDetailsWrapper}>
          <AppText variant="body1" style={styles.usernameText}>
            {username}
          </AppText>
          <View style={styles.balanceWrapper}>
            <IconBitcoin />
            <AppText variant="body5" style={styles.balanceText}>
              &nbsp;&nbsp;{balance}
            </AppText>
          </View>
        </View>
      </View>
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
