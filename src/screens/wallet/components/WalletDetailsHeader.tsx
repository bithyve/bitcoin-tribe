import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';

import AppText from 'src/components/AppText';
import IconBitcoin from 'src/assets/images/icon_btc1.svg';
import TransactionButtons from './TransactionButtons';
import WalletSectionHeader from './WalletSectionHeader';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import useBalance from 'src/hooks/useBalance';

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  wallet: Wallet;
  onPressSetting: () => void;
  onPressBuy: () => void;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common, sendScreen, home } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { profile, username, wallet, onPressSetting, onPressBuy } = props;
  const { getBalance, getCurrencyIcon } = useBalance();

  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;
  const { changeAddress: receivingAddress } =
    WalletOperations.getNextFreeChangeAddress(wallet);

  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} onPress={onPressSetting} />
      <AppText variant="body1" style={styles.usernameText}>
        {username}
      </AppText>
      <View>
        <AppText variant="body2" style={styles.totalBalText}>
          {home.totalBalance}
        </AppText>
      </View>
      <View style={styles.balanceWrapper}>
        {getCurrencyIcon(IconBitcoin, 'dark')}
        <AppText variant="walletBalance" style={styles.balanceText}>
          &nbsp;{getBalance(confirmed + unconfirmed)}
        </AppText>
      </View>
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
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN, {
              receivingAddress,
              title: common.receive,
              subTitle: receciveScreen.headerSubTitle,
            }),
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
      paddingBottom: 10,
    },
    usernameText: {
      color: theme.colors.accent3,
      textAlign: 'center',
      marginVertical: 10,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    totalBalText: {
      color: theme.colors.secondaryHeadingColor,
      fontWeight: '400',
    },
  });
export default WalletDetailsHeader;
