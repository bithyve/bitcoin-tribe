import React, { useContext, useEffect, useState } from 'react';
import { RadioButton, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import idx from 'idx';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import Toast from 'src/components/Toast';
import { ApiHandler } from 'src/services/handler/apiHandler';
import SendAddressIcon from 'src/assets/images/sendAddress.svg';
import SendAddressIconLight from 'src/assets/images/sendAddress_light.svg';
import { Keys, Storage } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useBalance from 'src/hooks/useBalance';
import { TxPriority } from 'src/services/wallets/enums';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';
import SendSuccessContainer from './SendSuccessContainer';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import { formatNumber } from 'src/utils/numberWithCommas';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';

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
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [amount, setAmount] = useState(
    paymentURIAmount ? `${paymentURIAmount}` : '',
  );
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [visible, setVisible] = useState(false);
  const [averageTxFee, setAverageTxFee] = useState({});
  const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const sendTransactionMutation = useMutation(ApiHandler.sendTransaction);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  useEffect(() => {
    if (!averageTxFeeJSON) {
      Toast(sendScreen.transFeeErrMsg, true);
    } else {
      const averageTxFeeByNetwork: AverageTxFeesByNetwork =
        JSON.parse(averageTxFeeJSON);
      const averageTxFee: AverageTxFees =
        averageTxFeeByNetwork[app.networkType];
      setAverageTxFee(averageTxFee);
    }
  }, [averageTxFeeJSON]);

  useEffect(() => {
    if (sendTransactionMutation.status === 'success') {
      setVisible(true);
    } else if (sendTransactionMutation.status === 'error') {
      Toast(`Error while sending: ${sendTransactionMutation.error}`, true);
    }
  }, [sendTransactionMutation]);

  const successTransaction = () => {
    setVisible(false);
    setTimeout(() => {
      navigation.navigate(NavigationRoutes.WALLETDETAILS, {
        autoRefresh: true,
      });
    }, 400);
  };

  const initiateSend = () => {
    sendTransactionMutation.mutate({
      sender: wallet,
      recipient: {
        address,
        amount: Number(amount.replace(/,/g, '')),
      },
      averageTxFee,
      selectedPriority,
    });
  };

  useEffect(() => {
    const balance = idx(wallet, _ => _.specs.balances);
    const availableToSpend = balance?.confirmed + balance?.unconfirmed;
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

  const getFeeRateByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].feePerByte) || 0;
  };

  const getEstimatedBlocksByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].estimatedBlocks) || 0;
  };

  const transferFee =
    idx(
      sendTransactionMutation,
      _ => _.data.txPrerequisites[selectedPriority].fee,
    ) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.txnDetailsContainer}>
          <View style={styles.txnLeftWrapper}>
            {!isThemeDark ? <SendAddressIcon /> : <SendAddressIconLight />}
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
          value={amount}
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
            {sendScreen.totalFee}
          </AppText>
          {initialCurrencyMode !== CurrencyKind.SATS
            ? getCurrencyIcon(IconBitcoin, 'dark')
            : null}
          <AppText variant="heading1" style={styles.amountText}>
            &nbsp; {getFeeRateByPriority(selectedPriority)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.satsText}>
              sats/vbyte
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
                &nbsp; {getFeeRateByPriority(TxPriority.LOW)} sats/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~{getEstimatedBlocksByPriority(TxPriority.LOW)} hours
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
                &nbsp;{getFeeRateByPriority(TxPriority.MEDIUM)} sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~{getEstimatedBlocksByPriority(TxPriority.MEDIUM)} hours
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
                &nbsp;{getFeeRateByPriority(TxPriority.HIGH)} sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~{getEstimatedBlocksByPriority(TxPriority.HIGH)} hours
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
          primaryOnPress={initiateSend}
          secondaryOnPress={navigation.goBack}
          width={wp(160)}
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
      <View>
        <ResponsePopupContainer
          visible={visible}
          title={sendScreen.sendSuccessTitle}
          subTitle={sendScreen.sendSuccessSubTitle}
          onDismiss={() => setVisible(false)}
          backColor={theme.colors.successPopupBackColor}
          borderColor={theme.colors.successPopupBorderColor}
          conatinerModalStyle={styles.containerModalStyle}>
          <SendSuccessContainer
            transID={idx(sendTransactionMutation, _ => _.data.txid) || ''}
            amount={amount.replace(/,/g, '')}
            transFee={transferFee}
            total={Number(amount) + Number(transferFee)}
            onPress={() => successTransaction()}
          />
        </ResponsePopupContainer>
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
    containerModalStyle: {
      margin: 0,
      padding: 10,
    },
  });
export default SendToContainer;
