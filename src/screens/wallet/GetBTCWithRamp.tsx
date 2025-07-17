import React, { useContext, useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import GradientView from 'src/components/GradientView';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import RampLogoIcon from 'src/assets/images/rampLogo.svg';
import RampLogoIconLight from 'src/assets/images/rampLogo_light.svg';
import AddressIcon from 'src/assets/images/addressIcon.svg';
import AddressIconLight from 'src/assets/images/addressIcon_light.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import WalletOperations from 'src/services/wallets/operations';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useWallets from 'src/hooks/useWallets';
import { fetchRampReservation } from 'src/services/thirdparty/ramp';

function GetBTCWithRamp() {
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletStrings, common } = translations;
  const wallet: Wallet = useWallets({}).wallets[0];
  const { receivingAddress } =
    WalletOperations.getNextFreeExternalAddress(wallet);

  const redirectBuyBtc = () => {
    const rampUrl = fetchRampReservation({ receiveAddress: receivingAddress });
    if (typeof rampUrl === 'string') {
      Linking.openURL(rampUrl);
    } else {
      console.error('Ramp URL generation failed:', rampUrl.error);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={walletStrings.rampTitle} />
      <View style={styles.bodyWrapper}>
        <View>
          <AppText variant="body2" style={[styles.labelText, styles.titleText]}>
            {walletStrings.rampSubTitle}
          </AppText>
          <GradientView
            style={styles.container}
            colors={[
              theme.colors.cardGradient1,
              theme.colors.cardGradient2,
              theme.colors.cardGradient3,
            ]}>
            <View>
              {isThemeDark ? (
                <RampLogoIcon height={35} />
              ) : (
                <RampLogoIconLight height={35} />
              )}
            </View>
            <AppText variant="body2" style={styles.labelText}>
              {walletStrings.rampInfo}
            </AppText>
          </GradientView>
        </View>
        <View>
          <AppText variant="body2" style={[styles.labelText, styles.titleText]}>
            {walletStrings.rampAddressLabel}
          </AppText>
          <GradientView
            style={styles.addressContainer}
            colors={[
              theme.colors.cardGradient1,
              theme.colors.cardGradient2,
              theme.colors.cardGradient3,
            ]}>
            <View style={styles.addressIconWrapper}>
              {isThemeDark ? <AddressIcon /> : <AddressIconLight />}
            </View>
            <View style={styles.addressContentWrapper}>
              <AppText variant="body2" style={styles.labelText}>
                {receivingAddress}
              </AppText>
            </View>
          </GradientView>
        </View>
      </View>
      <View style={styles.bottomViewWrapper}>
        <AppText variant="caption" style={styles.noteText}>
          {walletStrings.rampNote}
        </AppText>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={redirectBuyBtc}
          width={'100%'}
        />
      </View>
    </ScreenContainer>
  );
}

export default GetBTCWithRamp;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    labelText: {
      color: theme.colors.headingColor,
    },
    titleText: {
      marginTop: hp(20),
    },
    container: {
      padding: hp(20),
      borderRadius: 15,
      marginVertical: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    addressContainer: {
      flexDirection: 'row',
      width: '100%',
      padding: hp(20),
      borderRadius: 15,
      marginVertical: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    addressIconWrapper: {
      width: '15%',
    },
    addressContentWrapper: {
      width: '80%',
    },
    noteText: {
      color: theme.colors.secondaryHeadingColor,
      marginVertical: hp(20),
    },
    bottomViewWrapper: {
      flex: 1,
      bottom: 10,
    },
    bodyWrapper: {
      height: '72%',
    },
  });
