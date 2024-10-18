import React, { useContext } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import UserAvatar from 'src/components/UserAvatar';
import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc3_light.svg';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

type LightningWalletDetailsProps = {
  profile: string;
  username: string;
  confirmed: number;
  unconfirmed: number;
};

function LightningWalletDetailsCard(props: LightningWalletDetailsProps) {
  const { profile, username, confirmed, unconfirmed } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, home } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const styles = getStyles(theme);
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else if (initialCurrencyMode === CurrencyKind.BITCOIN) {
      setCurrencyMode(CurrencyKind.FIAT);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };
  console.log(username + ' ' + confirmed + ' ' + unconfirmed);
  return (
    <GradientView
      style={styles.balanceAndDetailsWrapper}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <ImageBackground
        source={require('src/assets/images/lightningCardBackImage.png')}
        resizeMode="cover"
        style={styles.backImage}>
        <View style={styles.profileWrapper}>
          <View style={styles.userInfoWrapper}>
            <AppText variant="body1" style={styles.usernameText}>
              {username}
            </AppText>
          </View>
          <View style={styles.userProfileWrapper}>
            <UserAvatar size={45} imageSource={profile} />
          </View>
        </View>
        <View>
          <View>
            <AppText variant="body2" style={styles.totalBalText}>
              {home.totalBalance}
            </AppText>
          </View>
          <AppTouchable
            style={styles.balanceWrapper}
            onPress={() => toggleDisplayMode()}>
            {initialCurrencyMode !== CurrencyKind.SATS && (
              <View style={styles.currencyIconWrapper}>
                {getCurrencyIcon(
                  !isThemeDark ? IconBitcoin : IconBitcoinLight,
                  !isThemeDark ? 'dark' : 'light',
                  30,
                )}
              </View>
            )}
            <AppText variant="walletBalance" style={styles.balanceText}>
              {getBalance(confirmed + unconfirmed)}
            </AppText>
            {initialCurrencyMode === CurrencyKind.SATS && (
              <AppText variant="caption" style={styles.satsText}>
                sats
              </AppText>
            )}
          </AppTouchable>
        </View>
      </ImageBackground>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    balanceAndDetailsWrapper: {
      width: '100%',
      marginVertical: hp(15),
      borderRadius: 10,
      borderColor: theme.colors.borderColor,
      borderWidth: 0.5,
    },
    backImage: {
      padding: hp(15),
    },
    profileWrapper: {
      flexDirection: 'row',
    },
    userInfoWrapper: {
      width: '70%',
      alignItems: 'flex-start',
    },
    userProfileWrapper: {
      width: '30%',
      alignItems: 'flex-end',
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(10),
      marginLeft: hp(5),
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(10),
    },
    usernameText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginVertical: 10,
    },
    totalBalText: {
      color: theme.colors.headingColor,
      fontWeight: '400',
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    currencyIconWrapper: {
      marginRight: hp(5),
    },
  });
export default LightningWalletDetailsCard;
