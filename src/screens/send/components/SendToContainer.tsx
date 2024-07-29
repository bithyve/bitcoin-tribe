import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import DeleteIcon from 'src/assets/images/delete.svg';
import KeyPadView from 'src/components/KeyPadView';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import idx from 'idx';
import Toast from 'src/components/Toast';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';

function SendToContainer({
  wallet,
  address,
  paymentURIAmount,
}: {
  wallet: Wallet;
  address: string;
  paymentURIAmount: Number;
}) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [amount, setAmount] = useState(
    paymentURIAmount ? `${paymentURIAmount}` : '',
  );
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const sendPhaseOneMutation = useMutation(ApiHandler.sendPhaseOne);

  useEffect(() => {
    if (sendPhaseOneMutation.status === 'success') {
      navigation.navigate(NavigationRoutes.BROADCASTTRANSACTION, {
        wallet,
        address,
        amount,
        txPrerequisites: sendPhaseOneMutation.data,
      });
    } else if (sendPhaseOneMutation.status === 'error') {
      Toast(`Error while sending: ${sendPhaseOneMutation.error}`);
    }
  }, [sendPhaseOneMutation]);

  const initiateSendPhaseOne = () => {
    if (insufficientBalance) {
      Toast('Amount entered is more than available to spend');
      return;
    }

    sendPhaseOneMutation.mutate({
      sender: wallet,
      recipient: {
        address,
        amount: Number(amount),
      },
    });
  };

  useEffect(() => {
    const balance = idx(wallet, _ => _.specs.balances);
    const availableToSpend = balance.confirmed + balance.unconfirmed;
    if (availableToSpend < Number(amount)) {
      setInsufficientBalance(true);
    } else {
      setInsufficientBalance(false);
    }
  }, [amount, wallet]);

  function onPressNumber(text) {
    let tmpPasscode = amount;
    if (text !== 'x') {
      tmpPasscode += text;
      setAmount(tmpPasscode);
    } else {
      setAmount(amount);
    }
  }

  const onDeletePressed = text => {
    setAmount(amount.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.txnDetailsContainer}>
          <View style={styles.txnLeftWrapper}>
            <View style={styles.leftText}>
              <AppText variant="body1">@</AppText>
            </View>
          </View>
          <View style={styles.txnRightWrapper}>
            <AppText variant="smallCTA" style={styles.sendToAddress}>
              SENDING TO ADDRESS
            </AppText>
            <AppText variant="body1" style={styles.txnID}>
              {address}
            </AppText>
          </View>
        </View>
        <TextField
          value={amount}
          onChangeText={text => setAmount(text)}
          placeholder={sendScreen.enterAmount}
          // keyboardType={'default'}
          disabled={true}
          icon={<IconBitcoin />}
          // rightText={common.sendMax}
          // onRightTextPress={() => {}}
        />
      </View>
      <View style={styles.primaryCTAContainer}>
        <Buttons
          disabled={!amount}
          primaryTitle={common.proceed}
          secondaryTitle={common.cancel}
          primaryOnPress={initiateSendPhaseOne}
          secondaryOnPress={navigation.goBack}
          width={wp(120)}
        />
      </View>
      <View style={styles.keyPadWrapper}>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={theme.colors.primaryCTA}
          ClearIcon={<DeleteIcon />}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '80%',
      width: '100%',
      marginTop: hp(5),
    },
    primaryCTAContainer: {
      marginVertical: hp(10),
    },
    wrapper: {
      flex: 1,
    },
    keyPadWrapper: {
      marginTop: hp(10),
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: hp(10),
    },
    txnDetailsContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: hp(20),
      alignItems: 'center',
    },
    txnLeftWrapper: {
      width: '20%',
    },
    leftText: {
      backgroundColor: theme.colors.primaryCTA,
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(50),
      width: hp(50),
      borderRadius: hp(50),
    },
    txnRightWrapper: {
      width: '80%',
    },
    sendToAddress: {
      color: theme.colors.primaryCTA,
    },
    txnID: {
      color: theme.colors.headingColor,
    },
  });
export default SendToContainer;
