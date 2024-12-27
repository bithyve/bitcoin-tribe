import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import idx from 'idx';
import { useQuery } from '@realm/react';

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
import { TxPriority } from 'src/services/wallets/enums';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';
import SendSuccessContainer from './SendSuccessContainer';
import { formatNumber } from 'src/utils/numberWithCommas';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
// import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import AppTouchable from 'src/components/AppTouchable';
import Colors from 'src/theme/Colors';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc3_light.svg';
import PrimaryCTA from 'src/components/PrimaryCTA';
import ModalContainer from 'src/components/ModalContainer';

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
  const [customFee, setCustomFee] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(address || '');
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [visible, setVisible] = useState(false);
  const [averageTxFee, setAverageTxFee] = useState({});
  const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const sendTransactionMutation = useMutation(ApiHandler.sendTransaction);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];

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
    } else if (sendTransactionMutation.status === 'error') {
      Toast(`Error while sending: ${sendTransactionMutation.error}`, true);
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

  const getFeeRateByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].feePerByte) || 0;
  };

  const getEstimatedBlocksByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].estimatedBlocks) || 0;
  };

  const transferFee =
    app.appType === AppType.NODE_CONNECT
      ? idx(sendTransactionMutation, _ => _.data.txPrerequisites.fee_rate) || 0 // Use feeEstimate for NODE_CONNECT
      : idx(
          sendTransactionMutation,
          _ => _.data.txPrerequisites[selectedPriority]?.fee,
        ) || 0;

  return (
    // sendTransactionMutation.status === 'loading' ? (
    //   <ResponsePopupContainer
    //     visible={sendTransactionMutation.status === 'loading'}
    //     enableClose={true}
    //     backColor={theme.colors.modalBackColor}
    //     borderColor={theme.colors.modalBackColor}>
    //     <InProgessPopupContainer
    //       title={sendScreen.sendBtcLoadingTitle}
    //       subTitle={sendScreen.sendBtcLoadingSubTitle}
    //       illustrationPath={
    //         isThemeDark
    //           ? require('src/assets/images/jsons/sendingBTCorAsset.json')
    //           : require('src/assets/images/jsons/sendingBTCorAsset_light.json')
    //       }
    //     />
    //   </ResponsePopupContainer>
    // ) : (
    <View style={styles.container}>
      <View style={styles.container1}>
        <View style={styles.wrapper}>
          <View style={styles.inputWrapper}>
            <AppText variant="body2" style={styles.recipientAddressLabel}>
              {sendScreen.recipientAddress}
            </AppText>
            <View style={styles.recipientAddressWrapper}>
              <AppText variant="body1" style={styles.recipientAddressText}>
                {recipientAddress}
              </AppText>
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <AppText variant="body2" style={styles.recipientAddressLabel}>
              {sendScreen.enterSats}
            </AppText>
            <TextField
              value={formatNumber(amount)}
              onChangeText={text => setAmount(text)}
              placeholder={sendScreen.enterAmount}
              keyboardType={'numeric'}
              inputStyle={styles.inputStyle}
              contentStyle={styles.contentStyle}
              // disabled={true}
              // icon={<IconBitcoin />}
              rightText={common.max}
              onRightTextPress={() => {}}
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
          {amount && (
            <>
              <AppText variant="body2" style={styles.recipientAddressLabel}>
                {sendScreen.fee}
              </AppText>
              <View style={styles.feeContainer}>
                <AppTouchable
                  onPress={() => setSelectedPriority(TxPriority.LOW)}
                  style={[
                    styles.feeWrapper,
                    {
                      borderColor:
                        selectedPriority === TxPriority.LOW
                          ? 'transparent'
                          : theme.colors.borderColor,
                      backgroundColor:
                        selectedPriority === TxPriority.LOW
                          ? theme.colors.accent1
                          : 'transparent',
                    },
                  ]}>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.LOW
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {sendScreen.low}
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.LOW
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {getFeeRateByPriority(TxPriority.LOW)} sat/vB
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityTimeValue,
                      {
                        color:
                          selectedPriority === TxPriority.LOW
                            ? Colors.Black
                            : theme.colors.secondaryHeadingColor,
                      },
                    ]}>
                    ~{getEstimatedBlocksByPriority(TxPriority.LOW)} hr
                  </AppText>
                </AppTouchable>
                <AppTouchable
                  onPress={() => setSelectedPriority(TxPriority.MEDIUM)}
                  style={[
                    styles.feeWrapper,
                    {
                      borderColor:
                        selectedPriority === TxPriority.MEDIUM
                          ? 'transparent'
                          : theme.colors.borderColor,
                      backgroundColor:
                        selectedPriority === TxPriority.MEDIUM
                          ? theme.colors.accent1
                          : 'transparent',
                    },
                  ]}>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.MEDIUM
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {sendScreen.medium}
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.MEDIUM
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {getFeeRateByPriority(TxPriority.MEDIUM)} sat/vB
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityTimeValue,
                      {
                        color:
                          selectedPriority === TxPriority.MEDIUM
                            ? Colors.Black
                            : theme.colors.secondaryHeadingColor,
                      },
                    ]}>
                    ~{getEstimatedBlocksByPriority(TxPriority.MEDIUM)} hr
                  </AppText>
                </AppTouchable>
                <AppTouchable
                  onPress={() => setSelectedPriority(TxPriority.HIGH)}
                  style={[
                    styles.feeWrapper,
                    {
                      borderColor:
                        selectedPriority === TxPriority.HIGH
                          ? 'transparent'
                          : theme.colors.borderColor,
                      backgroundColor:
                        selectedPriority === TxPriority.HIGH
                          ? theme.colors.accent1
                          : 'transparent',
                    },
                  ]}>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.HIGH
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {sendScreen.high}
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.HIGH
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {getFeeRateByPriority(TxPriority.HIGH)} sat/vB
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityTimeValue,
                      {
                        color:
                          selectedPriority === TxPriority.HIGH
                            ? Colors.Black
                            : theme.colors.secondaryHeadingColor,
                      },
                    ]}>
                    ~{getEstimatedBlocksByPriority(TxPriority.HIGH)} hr
                  </AppText>
                </AppTouchable>
                <AppTouchable
                  onPress={() => setSelectedPriority(TxPriority.CUSTOM)}
                  style={[
                    styles.feeWrapper,
                    {
                      borderColor:
                        selectedPriority === TxPriority.CUSTOM
                          ? 'transparent'
                          : theme.colors.borderColor,
                      backgroundColor:
                        selectedPriority === TxPriority.CUSTOM
                          ? theme.colors.accent1
                          : 'transparent',
                    },
                  ]}>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          selectedPriority === TxPriority.CUSTOM
                            ? Colors.Black
                            : theme.colors.headingColor,
                      },
                    ]}>
                    {sendScreen.custom}
                  </AppText>
                  <AppText
                    variant="body2"
                    style={[
                      styles.priorityTimeValue,
                      {
                        color:
                          selectedPriority === TxPriority.CUSTOM
                            ? Colors.Black
                            : theme.colors.secondaryHeadingColor,
                      },
                    ]}>
                    ~ 10 min
                  </AppText>
                </AppTouchable>
              </View>
            </>
          )}
          {selectedPriority === TxPriority.CUSTOM && (
            <View style={styles.inputWrapper}>
              <AppText variant="body2" style={styles.recipientAddressLabel}>
                {sendScreen.customFee}
              </AppText>
              <TextField
                value={formatNumber(customFee)}
                onChangeText={text => setCustomFee(text)}
                placeholder={sendScreen.enterCustomFee}
                keyboardType={'numeric'}
                inputStyle={styles.inputStyle}
                contentStyle={styles.contentStyle}
                // disabled={true}
                // icon={<IconBitcoin />}
                rightText={'sat/vB'}
                onRightTextPress={() => {}}
                rightCTATextColor={theme.colors.headingColor}
              />
            </View>
          )}
        </View>
      </View>
      {amount && (
        <View style={styles.primaryCTAContainer}>
          <PrimaryCTA
            disabled={!amount || !recipientAddress}
            title={common.next}
            onPress={() => setVisible(true)}
            width={'100%'}
          />
        </View>
      )}
      <ModalContainer
        title={
          sendTransactionMutation.status === 'success'
            ? 'Successful!'
            : sendScreen.sendConfirmation
        }
        subTitle={sendScreen.sendConfirmationSubTitle}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => {}}>
        <SendSuccessContainer
          // transID={idx(sendTransactionMutation, _ => _.data.txid) || ''}
          recipientAddress={recipientAddress}
          amount={amount.replace(/,/g, '')}
          transFee={transferFee}
          feeRate={getFeeRateByPriority(selectedPriority)}
          estimateBlockTime={getEstimatedBlocksByPriority(selectedPriority)}
          total={
            app.appType === AppType.NODE_CONNECT
              ? Number(amount)
              : Number(amount) + Number(transferFee)
          }
          onSuccessStatus={sendTransactionMutation.status === 'success'}
          onSuccessPress={() => successTransaction()}
          onPress={() => initiateSend()}
        />
      </ModalContainer>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '100%',
    },
    container1: {
      height: '80%',
      width: '100%',
      marginTop: hp(5),
    },
    primaryCTAContainer: {
      bottom: 0,
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
    recipientAddressWrapper: {
      backgroundColor: theme.colors.inputBackground,
      width: '100%',
      height: hp(65),
      padding: 10,
      borderRadius: 10,
      justifyContent: 'center',
    },
    recipientAddressText: {
      color: theme.colors.headingColor,
    },
    inputStyle: {
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
  });
export default SendToContainer;
