import React, { useContext, useEffect, useState } from 'react';
import { RadioButton, useTheme } from 'react-native-paper';
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
import SendAddressIcon from 'src/assets/images/sendAddress.svg';
import { formatNumber } from 'src/utils/numberWithCommas';
import { useMMKVString } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useBalance from 'src/hooks/useBalance';
import { TxPriority } from 'src/services/wallets/enums';

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
  const { getBalance, getCurrencyIcon } = useBalance();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [amount, setAmount] = useState(
    paymentURIAmount ? `${paymentURIAmount}` : '',
  );
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
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
      Toast(`Error while sending: ${sendPhaseOneMutation.error}`, false, true);
    }
  }, [sendPhaseOneMutation]);

  const initiateSendPhaseOne = () => {
    if (insufficientBalance) {
      Toast(sendScreen.amountMoreThanSpend, false, true);
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
            <SendAddressIcon />
          </View>
          <View style={styles.txnRightWrapper}>
            <AppText variant="body1" style={styles.sendToAddress}>
              {sendScreen.sendingToAddress}
            </AppText>
            <AppText
              variant="body2"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.txnID}>
              {address}
            </AppText>
          </View>
        </View>
        <TextField
          value={formatNumber(amount)}
          onChangeText={text => setAmount(text)}
          placeholder={sendScreen.enterAmount}
          keyboardType={'numeric'}
          // disabled={true}
          icon={<IconBitcoin />}
          // rightText={common.sendMax}
          // onRightTextPress={() => {}}
          // rightCTATextColor={theme.colors.accent1}
        />
        <View style={styles.totalFeeWrapper}>
          <AppText variant="heading1" style={styles.feeTitleText}>
            Total Fee:
          </AppText>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="heading1" style={styles.amountText}>
            &nbsp;{getBalance(2000)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats
            </AppText>
          )}
        </View>
        <View style={styles.feeWrapper}>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.LOW}
              status={
                selectedPriority === TxPriority.LOW ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.LOW)}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                Low -
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;1 sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~3hours
              </AppText>
            </View>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.MEDIUM}
              status={
                selectedPriority === TxPriority.MEDIUM ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.MEDIUM)}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                Medium -
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;1 sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~3hours
              </AppText>
            </View>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.HIGH}
              status={
                selectedPriority === TxPriority.HIGH ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.HIGH)}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                High -
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;1 sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~3hours
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.primaryCTAContainer}>
        <Buttons
          disabled={!amount}
          primaryTitle={common.broadcast}
          secondaryTitle={common.cancel}
          primaryOnPress={initiateSendPhaseOne}
          secondaryOnPress={navigation.goBack}
          width={wp(120)}
        />
      </View>
      {/* <View style={styles.keyPadWrapper}>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={theme.colors.accent1}
          ClearIcon={<DeleteIcon />}
        />
      </View> */}
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
    txnRightWrapper: {
      width: '80%',
    },
    sendToAddress: {
      color: theme.colors.headingColor,
    },
    txnID: {
      color: theme.colors.secondaryHeadingColor,
    },
    totalFeeWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(20),
    },
    feeTitleText: {
      color: theme.colors.headingColor,
      marginRight: hp(10),
    },
    amountText: {
      // marginLeft: hp(5),
      color: theme.colors.headingColor,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(5),
      marginLeft: hp(5),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    feeViewWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    feePriorityText: {
      color: theme.colors.headingColor,
      marginRight: hp(10),
    },
    feeText: {
      color: theme.colors.headingColor,
    },
    feeSatsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
  });
export default SendToContainer;
