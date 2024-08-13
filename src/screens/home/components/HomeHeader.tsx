import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';

import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconScanner from 'src/assets/images/icon_scanner.svg';
import IconNotification from 'src/assets/images/icon_notifications.svg';
import IconWrapper from 'src/components/IconWrapper';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import HomeUserAvatar from './HomeUserAvatar';
import useBalance from 'src/hooks/useBalance';
import { Keys } from 'src/storage';
import { useMMKVString } from 'react-native-mmkv';
import CurrencyKind from 'src/models/enums/CurrencyKind';

type HomeHeaderProps = {
  profile: string;
  username: string;
  balance: string;
  onPressProfile: () => void;
  onPressScanner: () => void;
  onPressNotification: () => void;
  onPressTotalAmt: () => void;
};
function HomeHeader(props: HomeHeaderProps) {
  const {
    profile,
    username,
    balance,
    onPressScanner,
    onPressNotification,
    onPressProfile,
    onPressTotalAmt,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = React.useContext(LocalizationContext);
  const { home } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  return (
    <View>
      <View style={styles.container}>
        <AppTouchable onPress={onPressProfile} style={styles.contentWrapper}>
          <View style={styles.contentWrapper}>
            <HomeUserAvatar imageSource={profile} />
            <View style={styles.userDetailsWrapper}>
              <AppText
                numberOfLines={1}
                variant="heading1"
                style={styles.usernameText}>
                {username}
              </AppText>
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
      <View style={styles.balanceContainer}>
        <View>
          <AppText variant="body2" style={styles.totalBalText}>
            {home.totalBalance}
          </AppText>
        </View>
        <AppTouchable style={styles.balanceWrapper} onPress={onPressTotalAmt}>
          {initialCurrencyMode !== CurrencyKind.SATS &&
            getCurrencyIcon(IconBitcoin, 'dark', 30)}
          <AppText variant="pageTitle2" style={styles.balanceText}>
            &nbsp;{getBalance(balance)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </AppTouchable>
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
      color: theme.colors.headingColor,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceText: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(10),
      marginLeft: hp(5),
    },
    iconWrapper: {
      width: '32%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    iconTouchableArea: {
      height: '60%',
    },
    balanceContainer: {
      alignItems: 'center',
      marginTop: hp(30),
      marginBottom: hp(5),
    },
    totalBalText: {
      color: theme.colors.secondaryHeadingColor,
      fontWeight: '400',
    },
  });
export default HomeHeader;
