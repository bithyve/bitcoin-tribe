import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';

import AppText from 'src/components/AppText';
import IconBitcoin from 'src/assets/images/icon_btc1.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import TransactionButtons from '../wallet/components/TransactionButtons';
import WalletSectionHeader from '../wallet/components/WalletSectionHeader';
import { Coin } from 'src/models/interfaces/RGBWallet';
import Toolbar from './Toolbar';

type CoinDetailsHeaderProps = {
  coin: Coin;
  onPressSetting: () => void;
  onPressBuy: () => void;
};
function CoinDetailsHeader(props: CoinDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common, sendScreen } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { coin, onPressSetting, onPressBuy } = props;

  return (
    <View style={styles.container}>
      <Toolbar onPress={onPressSetting} ticker={coin.ticker} />
      <AppText variant="body1" style={styles.usernameText}>
        {coin.name}
      </AppText>
      <View style={styles.balanceWrapper}>
        <AppText variant="walletBalance" style={styles.balanceText}>
          {coin.balance.spendable}
        </AppText>
      </View>
      <TransactionButtons
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SENDASSET, {
            assetId: coin.assetId,
          })
        }
        onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.navigate(NavigationRoutes.RECEIVEASSET)
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
      marginVertical: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
  });
export default CoinDetailsHeader;