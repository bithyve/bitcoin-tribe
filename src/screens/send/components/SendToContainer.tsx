import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTheme } from 'react-native-paper';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import idx from 'idx';
import { useQuery } from '@realm/react';
import Clipboard from '@react-native-clipboard/clipboard';

import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import TextField from 'src/components/TextField';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import Toast from 'src/components/Toast';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { Keys, Storage } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useBalance from 'src/hooks/useBalance';
import { PaymentInfoKind, TxPriority } from 'src/services/wallets/enums';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';
import SendSuccessContainer from './SendSuccessContainer';
import { formatNumber } from 'src/utils/numberWithCommas';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import PrimaryCTA from 'src/components/PrimaryCTA';
import ModalContainer from 'src/components/ModalContainer';
import FeePriorityButton from './FeePriorityButton';
import { ConvertSatsToFiat } from 'src/constants/Bitcoin';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import WalletOperations from 'src/services/wallets/operations';

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
  const [exchangeRates] = useMMKVString(Keys.EXCHANGE_RATES);
  const [currencyCode] = useMMKVString(Keys.APP_CURRENCY);
  const { getBalance, getCurrencyIcon } = useBalance();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen, assets } = translations;
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const [amount, setAmount] = useState(
    paymentURIAmount ? `${paymentURIAmount}` : '',
  );
  const [customFee, setCustomFee] = useState(0);
  const [isSendMax, setIsSendMax] = useState(false);
  const [sendMaxFee, setSendMaxFee] = useState(0);
  const [sendMaxFeeInSats, setSendMaxFeeInSats] = useState(0);
  const [sendMaxAmountInSats, setSendMaxAmountInSats] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(address || '');
  const [inputHeight, setInputHeight] = React.useState(100);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [visible, setVisible] = useState(false);
  const [averageTxFee, setAverageTxFee] = useState({});
  const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const {
    mutate: executePhaseOneTransaction,
    isLoading,
    error,
    data: phaseOneTxPrerequisites,
  } = useMutation(ApiHandler.sendPhaseOne);
  const sendTransactionMutation = useMutation(ApiHandler.sendTransaction);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const styles = React.useMemo(
    () => getStyles(theme, inputHeight),
    [theme, inputHeight],
  );

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
    const { status, error, reset } = sendTransactionMutation;
    if (status === 'success') {
    } else if (status === 'error') {
      setVisible(false);
      reset();
      const errorMessage = error?.message || error?.toString();
      if (errorMessage.includes('dust')) {
        Toast(sendScreen.dustAmountMsg, true);
      } else {
        Toast(errorMessage, true);
      }
    }
  }, [sendTransactionMutation]);

  const successTransaction = () => {
    setVisible(false);
    sendTransactionMutation.reset();
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: NavigationRoutes.HOME },
            {
              name: NavigationRoutes.WALLETDETAILS,
              params: { autoRefresh: true },
            },
          ],
        }),
      );
    }, 400);
  };

  const validateAddressOrInput = (input: string) => {
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    let { type: paymentInfoKind, amount } = WalletUtilities.addressDiff(
      input.trim(),
      network,
    );
    if (amount) {
      amount = Math.trunc(amount * 1e8);
    }
    if (paymentInfoKind) {
      Keyboard.dismiss();
      switch (paymentInfoKind) {
        case PaymentInfoKind.ADDRESS:
        case PaymentInfoKind.PAYMENT_URI:
          return true;
        default:
          return false;
      }
    } else {
      Keyboard.dismiss();
      Toast(sendScreen.invalidBtcAddress, true); // Invalid input
    }
  };

  const initiateSend = () => {
    if (!validateAddressOrInput(recipientAddress)) {
      Toast(sendScreen.invalidBtcAddress, true);
      return;
    }
    setVisible(true);
    if (app.appType === AppType.ON_CHAIN) {
      if (selectedPriority === TxPriority.CUSTOM) {
        averageTxFee.custom = {
          averageTxFee: Number(customFee),
          estimatedBlocks: 1,
          feePerByte: Number(customFee),
        };
      }
      executePhaseOneTransaction({
        sender: wallet,
        recipient: {
          address: recipientAddress,
          amount:
            isSendMax && initialCurrencyMode === CurrencyKind.FIAT
              ? parseFloat(sendMaxAmountInSats)
              : parseFloat(amount.replace(/,/g, '')),
        },
        averageTxFee,
        selectedPriority,
        customFeePerByte: customFee,
      });
    }
  };

  const broadcastTransaction = () => {
    if (selectedPriority === TxPriority.CUSTOM) {
      averageTxFee.custom = {
        averageTxFee: Number(customFee),
        estimatedBlocks: 1,
        feePerByte: Number(customFee),
      };
    }
    sendTransactionMutation.mutate({
      sender: wallet,
      recipient: {
        address: recipientAddress,
        amount: Number(amount.replace(/,/g, '')),
      },
      averageTxFee,
      txPrerequisites: phaseOneTxPrerequisites,
      selectedPriority,
      customFeePerByte: customFee,
    });
  };

  const balances = useMemo(() => {
    if (app.appType === AppType.NODE_CONNECT) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    } else {
      return (
        wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed
      );
    }
  }, [
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
  ]);

  useEffect(() => {
    const balance = idx(wallet, _ => _.specs.balances);
    const availableToSpend = balance?.confirmed + balance?.unconfirmed;
    if (availableToSpend < Number(amount)) {
      setInsufficientBalance(true);
    } else {
      setInsufficientBalance(false);
    }
  }, [amount, wallet]);

  useEffect(() => {
    const recipients = [];
    recipients.push({
      address: recipientAddress,
      amount: 0,
    });
    const fee = WalletOperations.calculateSendMaxFee(
      wallet,
      recipients,
      selectedPriority === TxPriority.CUSTOM
        ? Number(customFee)
        : averageTxFee[selectedPriority]?.feePerByte,
    );
    console.log('fee', fee);
    setSendMaxFee(fee);
  }, [recipientAddress, amount, selectedPriority, customFee]);

  const getFeeRateByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].feePerByte) || 0;
  };
  const getAvgTxnFeeByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].averageTxFee) || 0;
  };
  const getEstimatedBlocksByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].estimatedBlocks) || 0;
  };

  const transferFee =
    app.appType === AppType.NODE_CONNECT
      ? idx(sendTransactionMutation, _ => _.data.txPrerequisites.fee_rate) || 0 // Use feeEstimate for NODE_CONNECT
      : isSendMax
      ? sendMaxFee
      : idx(phaseOneTxPrerequisites, data => data[selectedPriority]?.fee) || 0;

  const onSendMax = useCallback(() => {
    if (!recipientAddress) {
      Toast('Please enter recipient address first', true);
      return;
    }
    setIsSendMax(true);
    const availableToSpend = balances;
    if (
      initialCurrencyMode === CurrencyKind.SATS ||
      initialCurrencyMode === CurrencyKind.BITCOIN
    ) {
      const sendMaxBalance = Number(availableToSpend) - Number(sendMaxFee);
      setAmount(sendMaxBalance.toFixed(0));
    } else {
      const feeAmount = ConvertSatsToFiat(
        Number(sendMaxFee),
        JSON.parse(exchangeRates),
        currencyCode,
      );
      setSendMaxFeeInSats(sendMaxFee);
      const amountToSend = ConvertSatsToFiat(
        Number(availableToSpend),
        JSON.parse(exchangeRates),
        currencyCode,
      );
      const sendMaxSatsBalance = Number(availableToSpend) - Number(sendMaxFee);
      const sendMaxBalance = Number(amountToSend) - Number(feeAmount);
      setAmount(sendMaxBalance.toFixed(2));
      setSendMaxAmountInSats(sendMaxSatsBalance.toFixed(0));
    }
  }, [isSendMax, selectedPriority, sendMaxFee]);

  useEffect(() => {
    if ((isSendMax && selectedPriority) || customFee) {
      onSendMax();
    }
  }, [selectedPriority, isSendMax, customFee, sendMaxFee]);

  const handlePasteAddress = async () => {
    const clipboardValue = await Clipboard.getString();
    if (validateAddressOrInput(clipboardValue)) {
      setRecipientAddress(clipboardValue);
    } else {
      Toast(sendScreen.invalidBtcAddress, true);
    }
  };
  const handleAmountInputChange = text => {
    setIsSendMax(false);
    const numericValue = parseFloat(text.replace(/,/g, '') || '0');
    if (numericValue === 0) {
      Keyboard.dismiss();
      setAmount('');
      Toast(sendScreen.validationZeroNotAllowed, true);
    } else if (Number(balances) === 0) {
      Keyboard.dismiss();
      Toast(sendScreen.availableBalanceMsg + balances, true);
    } else if (numericValue <= Number(balances)) {
      setAmount(text);
      // setIsSendMax(false);
    } else {
      Keyboard.dismiss();
      Toast(assets.checkSpendableAmt + balances, true);
    }
  };
  const handleCustomFeeInput = text => {
    const isValidNumber = /^\d*\.?\d*$/.test(text);
    if (text.startsWith('0') && !text.startsWith('0.')) {
      setCustomFee(text.replace(/^0+/, ''));
      Toast(sendScreen.validationZeroNotAllowed, true);
      Keyboard.dismiss();
      return;
    }
    const numericValue = parseFloat(text);
    if (!isValidNumber || isNaN(numericValue) || numericValue < 1) {
      setCustomFee(0);
      return;
    }
    setCustomFee(text);
  };

  return (
    <>
      <KeyboardAvoidView style={styles.container}>
        <View style={styles.inputWrapper}>
          <AppText variant="body2" style={styles.recipientAddressLabel}>
            {sendScreen.recipientAddress}
          </AppText>
          <TextField
            value={recipientAddress}
            onChangeText={text => setRecipientAddress(text)}
            placeholder={sendScreen.recipientAddress}
            // style={styles.input}
            multiline={true}
            returnKeyType={'Enter'}
            onContentSizeChange={event => {
              setInputHeight(event.nativeEvent.contentSize.height);
            }}
            numberOfLines={3}
            contentStyle={
              recipientAddress
                ? styles.recipientContentStyle
                : styles.contentStyle1
            }
            inputStyle={styles.recipientInputStyle}
            rightText={!recipientAddress && sendScreen.paste}
            rightIcon={recipientAddress && <ClearIcon />}
            onRightTextPress={() =>
              recipientAddress ? setRecipientAddress('') : handlePasteAddress()
            }
            rightCTAStyle={styles.rightCTAStyle}
          />
        </View>
        <View style={styles.inputWrapper}>
          <AppText variant="body2" style={styles.recipientAddressLabel}>
            {initialCurrencyMode === CurrencyKind.SATS ||
            initialCurrencyMode === CurrencyKind.BITCOIN
              ? sendScreen.enterSats
              : sendScreen.enterFiat}
          </AppText>
          <TextField
            value={formatNumber(amount)}
            onChangeText={handleAmountInputChange}
            placeholder={sendScreen.enterAmount}
            keyboardType={'numeric'}
            inputStyle={styles.inputStyle}
            contentStyle={styles.contentStyle}
            rightText={common.max}
            onRightTextPress={() => onSendMax()}
            rightCTATextColor={theme.colors.accent1}
          />
        </View>
        <View style={styles.availableBalanceWrapper}>
          <AppText variant="body2" style={styles.recipientAddressLabel}>
            {sendScreen.availableBalance}
          </AppText>
          <View style={styles.balanceWrapper}>
            {initialCurrencyMode !== CurrencyKind.SATS && (
              <View style={styles.currencyIconWrapper}>
                {getCurrencyIcon(
                  isThemeDark ? IconBitcoin : IconBitcoinLight,
                  isThemeDark ? 'dark' : 'light',
                  10,
                )}
              </View>
            )}
            <AppText variant="body2" style={styles.availableBalanceText}>
              {getBalance(balances)}
            </AppText>
            {initialCurrencyMode === CurrencyKind.SATS && (
              <AppText variant="caption" style={styles.satsText}>
                sats
              </AppText>
            )}
          </View>
        </View>
        <AppText variant="body2" style={styles.recipientAddressLabel}>
          {sendScreen.fee}
        </AppText>
        <View style={styles.feeContainer}>
          <FeePriorityButton
            title={sendScreen.low}
            priority={TxPriority.LOW}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedPriority(TxPriority.LOW);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.LOW)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.LOW,
            )}
          />
          <FeePriorityButton
            title={sendScreen.medium}
            priority={TxPriority.MEDIUM}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedPriority(TxPriority.MEDIUM);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.MEDIUM)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.MEDIUM,
            )}
          />
          <FeePriorityButton
            title={sendScreen.high}
            priority={TxPriority.HIGH}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedPriority(TxPriority.HIGH);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.HIGH)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.HIGH,
            )}
          />
          <FeePriorityButton
            title={sendScreen.custom}
            priority={TxPriority.CUSTOM}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => setSelectedPriority(TxPriority.CUSTOM)}
            feeRateByPriority={0}
            estimatedBlocksByPriority={1}
          />
        </View>
        {selectedPriority === TxPriority.CUSTOM && (
          <View style={styles.inputWrapper}>
            <AppText variant="body2" style={styles.recipientAddressLabel}>
              {sendScreen.customFee}
            </AppText>
            <TextField
              value={customFee}
              onChangeText={handleCustomFeeInput}
              placeholder={sendScreen.enterCustomFee}
              keyboardType={'numeric'}
              inputStyle={styles.customFeeInputStyle}
              contentStyle={styles.contentStyle}
              rightText={'sat/vB'}
              onRightTextPress={() => {}}
              rightCTATextColor={theme.colors.headingColor}
            />
          </View>
        )}
      </KeyboardAvoidView>
      <View style={styles.primaryCTAContainer}>
        {amount && (
          <PrimaryCTA
            disabled={
              !amount ||
              !recipientAddress ||
              (selectedPriority === TxPriority.CUSTOM && !customFee)
            }
            title={common.next}
            onPress={() => initiateSend()}
            width={'100%'}
          />
        )}
      </View>

      <ModalContainer
        title={
          sendTransactionMutation.status === 'success'
            ? sendScreen.successTitle
            : sendScreen.sendConfirmation
        }
        subTitle={
          sendTransactionMutation.status !== 'success'
            ? sendScreen.sendConfirmationSubTitle
            : ''
        }
        height={
          sendTransactionMutation.status === 'success'
            ? Platform.OS === 'android'
              ? '100%'
              : '48%'
            : ''
        }
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() =>
          sendTransactionMutation.status === 'loading' ||
          sendTransactionMutation.status === 'success'
            ? {}
            : setVisible(false)
        }>
        <SendSuccessContainer
          // transID={idx(sendTransactionMutation, _ => _.data.txid) || ''}
          recipientAddress={recipientAddress}
          amount={
            isSendMax && initialCurrencyMode === CurrencyKind.FIAT
              ? sendMaxAmountInSats
              : amount.replace(/,/g, '')
          }
          transFee={
            isSendMax && initialCurrencyMode === CurrencyKind.FIAT
              ? sendMaxFeeInSats
              : transferFee
          }
          feeRate={
            selectedPriority === TxPriority.CUSTOM
              ? customFee
              : getFeeRateByPriority(selectedPriority)
          }
          estimateBlockTime={
            selectedPriority === TxPriority.CUSTOM
              ? 1
              : getEstimatedBlocksByPriority(selectedPriority)
          }
          selectedPriority={selectedPriority}
          total={
            isSendMax && initialCurrencyMode === CurrencyKind.FIAT
              ? sendMaxAmountInSats
              : amount.replace(/,/g, '')
          }
          onSuccessStatus={sendTransactionMutation.status === 'success'}
          onSuccessPress={() => successTransaction()}
          onPress={() => broadcastTransaction()}
        />
      </ModalContainer>
    </>
  );
}
const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    primaryCTAContainer: {
      bottom: 5,
    },
    wrapper: {
      flex: 1,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    inputWrapper: {
      paddingBottom: 16,
    },
    recipientAddressLabel: {
      marginVertical: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    recipientInputStyle: {
      width: '80%',
    },
    inputStyle: {
      width: '80%',
    },
    customFeeInputStyle: {
      width: '80%',
    },
    contentStyle: {
      marginTop: 0,
    },
    feeContainer: {
      flexDirection: 'row',
    },
    feeWrapper: {
      padding: 15,
      borderWidth: 1,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: hp(5),
    },
    priorityValue: {
      color: theme.colors.headingColor,
    },
    priorityTimeValue: {
      marginTop: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    availableBalanceText: {
      color: theme.colors.headingColor,
    },
    availableBalanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    currencyIconWrapper: {
      marginRight: hp(5),
    },
    input: {
      width: '85%',
    },
    rightCTAStyle: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recipientContentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
      // marginTop: hp(5),
    },
  });
export default SendToContainer;
