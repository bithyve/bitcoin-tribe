import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';

import AppText from 'src/components/AppText';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import TransactionButtons from './TransactionButtons';
import WalletSectionHeader from './WalletSectionHeader';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  balance: string;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, username, balance } = props;
  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} />
      <AppText
        variant="body1"
        style={styles.usernameText}
        testID="text_username">
        {username}
      </AppText>
      <View style={styles.balanceWrapper}>
        <IconBitcoin />
        <AppText
          variant="walletBalance"
          style={styles.balanceText}
          testID="text_balance">
          &nbsp;{balance}
        </AppText>
      </View>
      <TransactionButtons
        onPressSend={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.SENDSCREEN),
          )
        }
        onPressBuy={() => console.log('buy')}
        onPressRecieve={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN),
          )
        }
      />
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      paddingBottom: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: 'gray',
    },
    usernameText: {
      color: theme.colors.accent3,
      textAlign: 'center',
      marginVertical: 10,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
  });
export default WalletDetailsHeader;
