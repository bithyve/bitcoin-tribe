import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery as realmUseQuery } from '@realm/react';

import TransactionButtons from './TransactionButtons';
import WalletSectionHeader from './WalletSectionHeader';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import BitcoinWalletDetailsCard from './BitcoinWalletDetailsCard';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  wallet?: Wallet;
  rgbWallet?: RGBWallet;
  activeTab: string;
  onPressSetting?: () => void;
  onPressBuy: () => void;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const theme: AppTheme = useTheme();

  const styles = getStyles(theme);
  const { profile, username, wallet, rgbWallet, onPressSetting, onPressBuy } =
    props;

  // const {
  //   specs: { balances: { confirmed, unconfirmed } } = {
  //     balances: { confirmed: 0, unconfirmed: 0 },
  //   },
  // } = wallet || {};
  const app: TribeApp = realmUseQuery(RealmSchema.TribeApp)[0];
  const balances = useMemo(() => {
    // console.log('rgbWallet?.nodeBtcBalance', rgbWallet?.nodeBtcBalance);
    if (app.appType === AppType.NODE_CONNECT) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    } else {
      return (
        wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed
      );
    }
  }, [rgbWallet?.nodeBtcBalance?.vanilla?.spendable]);

  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} onPress={onPressSetting} />
      <BitcoinWalletDetailsCard
        profile={profile}
        balances={balances}
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
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN),
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
export default WalletDetailsHeader;
