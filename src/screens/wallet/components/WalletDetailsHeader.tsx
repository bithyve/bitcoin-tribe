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

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  balance: string;
  onPressSetting: () => void;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { profile, username, balance, onPressSetting } = props;
  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} onPress={onPressSetting} />
      <AppText variant="body1" style={styles.usernameText}>
        {username}
      </AppText>
      <View style={styles.balanceWrapper}>
        <IconBitcoin />
        <AppText variant="walletBalance" style={styles.balanceText}>
          {balance}
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
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN, {
              receiveData: '',
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
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
  });
export default WalletDetailsHeader;
