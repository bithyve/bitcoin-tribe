import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';

import TransactionButtons from './TransactionButtons';
import WalletSectionHeader from './WalletSectionHeader';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import LightningWalletDetailsCard from './LightningWalletDetailsCard';

type RGBNodeHeaderProps = {
  profile: string;
  username: string;
  wallet: Wallet;
  activeTab: string;
  onPressSetting?: () => void;
  onPressBuy: () => void;
};
function RGBNodeWalletHeader(props: RGBNodeHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const {
    // receciveScreen,
    common,
    sendScreen,
    // home,
    // wallet: walletTranslations,
  } = translations;
  const theme: AppTheme = useTheme();

  const styles = getStyles(theme);
  const { profile, username, wallet, activeTab, onPressSetting, onPressBuy } =
    props;

  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;

  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} onPress={onPressSetting} />
      <LightningWalletDetailsCard
        profile={profile}
        confirmed={confirmed}
        unconfirmed={unconfirmed}
        username={username}
      />
      <TransactionButtons
        onPressSend={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.SENDSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.headerSubTitle,
              wallet: wallet,
            }),
          )
        }
        // onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.LIGHTNINGRECEIVE),
          )
        }
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      paddingBottom: Platform.OS === 'android' ? 0 : 10,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(10),
      marginLeft: hp(5),
    },
    profileWrapper: {
      flexDirection: 'row',
    },
  });
export default RGBNodeWalletHeader;