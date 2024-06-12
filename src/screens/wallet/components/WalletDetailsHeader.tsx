import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import UserAvatar from 'src/components/UserAvatar';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import TransactionButtons from './TransactionButtons';

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  balance: string;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, username, balance } = props;
  return (
    <View style={styles.contentWrapper}>
      <UserAvatar size={70} imageSource={profile} />
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
        onPressSend={() => console.log('send')}
        onPressBuy={() => console.log('buy')}
        onPressRecieve={() => console.log('recieve')}
      />
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    contentWrapper: {
      alignItems: 'center',
      width: '100%',
      // position: 'absolute',
      // top: 30,
      // left: 20,
      paddingBottom: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: 'gray',
      marginBottom: 10,
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
