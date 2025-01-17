import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import TransactionButtons from '../wallet/components/TransactionButtons';
import { Coin } from 'src/models/interfaces/RGBWallet';
import Toolbar from './Toolbar';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

type CoinDetailsHeaderProps = {
  coin: Coin;
  wallet: Wallet;
  onPressSetting: () => void;
  onPressBuy?: () => void;
};
function CoinDetailsHeader(props: CoinDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { coin, wallet, onPressSetting, onPressBuy } = props;
  return (
    <View style={styles.container}>
      <Toolbar onPress={onPressSetting} ticker={coin.ticker} />
      <AppText variant="body1" style={styles.usernameText}>
        {coin.name}
      </AppText>
      <View>
        <AppText variant="body2" style={styles.totalBalText}>
          {home.totalBalance}
        </AppText>
      </View>
      <View style={styles.balanceWrapper}>
        <AppText
          variant="walletBalance"
          style={[
            styles.balanceText,
            {
              fontSize: coin.balance.future.toString().length > 10 ? 24 : 39,
            },
          ]}>
          {numberWithCommas(
            coin.balance.future + coin.balance?.offchainOutbound,
          )}
        </AppText>
      </View>
      <TransactionButtons
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: coin.assetId,
            rgbInvoice: '',
            wallet: wallet,
          })
        }
        // onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.navigate(NavigationRoutes.RECEIVEASSET, {
            refresh: true,
          })
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
export default CoinDetailsHeader;
