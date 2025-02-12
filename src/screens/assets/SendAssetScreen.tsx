import { Image, Keyboard, Platform, StyleSheet, View } from 'react-native';
import React, {
  useCallback,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Switch, useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import idx from 'idx';
import Clipboard from '@react-native-clipboard/clipboard';
import { useQuery } from '@realm/react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import {
  Asset,
  AssetFace,
  Coin,
  Collectible,
} from 'src/models/interfaces/RGBWallet';
import { TxPriority } from 'src/services/wallets/enums';
import { Keys } from 'src/storage';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';
import { formatNumber, numberWithCommas } from 'src/utils/numberWithCommas';
import config from 'src/utils/config';
import Identicon from 'src/components/Identicon';
import FeePriorityButton from '../send/components/FeePriorityButton';
import ModalContainer from 'src/components/ModalContainer';
import SendAssetSuccess from './components/SendAssetSuccess';
import Colors from 'src/theme/Colors';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import ModalLoading from 'src/components/ModalLoading';

type ItemProps = {
  name: string;
  details?: string;
  image?: string;
  tag?: string;
  onPressAsset?: (item: any) => void;
  assetId?: string;
  amount?: string;
};

const AssetItem = ({
  name,
  details,
  image,
  tag,
  onPressAsset,
  assetId,
  amount,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme, 100), [theme]);
  return (
    <AppTouchable onPress={onPressAsset}>
      <GradientView
        style={styles.assetItemWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        {image ? (
          <View style={styles.identiconWrapper}>
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageStyle}
            />
          </View>
        ) : (
          <View style={styles.identiconWrapper}>
            {/* <View style={styles.identiconWrapper2}> */}
            <Identicon value={assetId} style={styles.identiconView} size={50} />
            {/* </View> */}
          </View>
        )}
        <View style={styles.assetDetailsWrapper}>
          <AppText
            numberOfLines={1}
            variant="body2"
            style={{
              color:
                tag === 'Coin' ? theme.colors.accent : theme.colors.accent4,
            }}>
            {name}
          </AppText>
          <AppText numberOfLines={1} variant="body2" style={styles.nameText}>
            {details}
          </AppText>
        </View>
        <View style={styles.amountWrapper}>
          <View
            style={[
              styles.amountTextWrapper,
              {
                backgroundColor:
                  tag === 'Coin' ? theme.colors.accent : theme.colors.accent4,
              },
            ]}>
            <AppText variant="smallCTA" style={styles.amountText}>
              {numberWithCommas(amount)}
            </AppText>
          </View>
        </View>
      </GradientView>
    </AppTouchable>
  );
};

const SendAssetScreen = () => {
  const { assetId, rgbInvoice, amount } = useRoute().params;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const {
    sendScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;

  const [averageTxFeeJSON] = useMMKVString(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const averageTxFeeByNetwork: AverageTxFeesByNetwork =
    JSON.parse(averageTxFeeJSON);
  const averageTxFee: AverageTxFees =
    averageTxFeeByNetwork[config.NETWORK_TYPE];
  const createUtxos = useMutation(ApiHandler.createUtxos);
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const udas = useQuery<Collectible[]>(RealmSchema.UniqueDigitalAsset);
  const allAssets: Asset[] = [...coins, ...collectibles, ...udas];
  const assetData = allAssets.find(item => item.assetId === assetId);
  const [invoice, setInvoice] = useState(rgbInvoice || '');
  const [assetAmount, setAssetAmount] = useState(
    assetData.assetIface.toUpperCase() === AssetFace.RGB21 ? '1' : amount || '',
  );
  const [inputHeight, setInputHeight] = useState(100);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [validatingInvoiceLoader, setValidatingInvoiceLoader] = useState(false);
  const [customFee, setCustomFee] = useState(0);
  const [amountValidationError, setAmountValidationError] = useState('');
  const [invoiceValidationError, setInvoiceValidationError] = useState('');
  const [customAmtValidationError, setCustomAmtValidationError] = useState('');
  const [successStatus, setSuccessStatus] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [selectedPriority, setSelectedPriority] = useState(TxPriority.LOW);
  const [isDonation, setIsDonation] = useState(false);
  const [selectedFeeRate, setSelectedFeeRate] = useState(
    averageTxFee[TxPriority.LOW].feePerByte,
  );
  const styles = getStyles(theme, inputHeight);
  const isButtonDisabled = useMemo(() => {
    return (
      !invoice ||
      assetAmount === '' ||
      assetAmount === '0' ||
      (selectedPriority === TxPriority.CUSTOM && !customFee)
    );
  }, [invoice, assetAmount, customFee, selectedPriority]);

  useEffect(() => {
    if (createUtxos.data) {
      setLoading(true);
      setTimeout(() => {
        sendAsset();
      }, 500);
    } else if (createUtxos.data === false) {
      setLoading(false);
      Toast(walletTranslation.failedToCreateUTXO, true);
    }
  }, [createUtxos.data]);

  const handleAmountInputChange = text => {
    const numericValue = parseFloat(text.replace(/,/g, '') || null);
    if (isNaN(numericValue)) {
      setAmountValidationError('');
      setAssetAmount('');
    } else if (numericValue === 0) {
      setAssetAmount(text);
      setAmountValidationError(sendScreen.validationZeroNotAllowed);
    } else if (Number(assetData?.balance.spendable) === 0) {
      setAmountValidationError(
        sendScreen.spendableBalanceMsg + assetData?.balance.spendable,
      );
    } else if (numericValue <= assetData?.balance.spendable) {
      setAssetAmount(text);
      setAmountValidationError('');
    } else if (numericValue > Number(assetData?.balance.spendable)) {
      setAmountValidationError(
        assets.checkSpendableAmt + assetData?.balance.spendable,
      );
    } else {
      setAssetAmount('');
      setAmountValidationError('');
    }
  };

  /* todo send asset with precision
  const handleAmountInputChange = text => {
    let regex;
    if (assetData.precision === 0) {
      regex = /^[1-9]\d*$/;
    } else {
      regex = new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${assetData.precision}})?$`);
    }    if (text === '' || regex.test(text)) {
      setAssetAmount(text);
      const numericValue = parseFloat(text || '0');
      if (Number(assetData?.balance.spendable) === 0) {
        Keyboard.dismiss();
        Toast(
          sendScreen.spendableBalanceMsg + assetData?.balance.spendable,
          true,
        );
      } else if (numericValue <= assetData?.balance.spendable) {
        setAssetAmount(text);
      } else {
        Keyboard.dismiss();
        Toast(assets.checkSpendableAmt + assetData?.balance.spendable, true);
      }
    }
  };
  */

  const getFeeRateByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].feePerByte) || 0;
  };
  const getEstimatedBlocksByPriority = (priority: TxPriority) => {
    return idx(averageTxFee, _ => _[priority].estimatedBlocks) || 0;
  };

  const decodeInvoice = (_invoice: string) => {
    const utxoPattern = /(bcrt|tb):utxob:[a-zA-Z0-9\-$!]+/;
    const assetIdPattern = /(?:^|\s)([a-zA-Z0-9\-$]{20,})(?=\/|$)/;
    const assetTypePattern = /\/(RGB20Fixed|RGB20|RGB25|RGB|[^/]+)(?=\/|$)/;
    const expiryPattern = /expiry=(\d+)/;
    const endpointPattern = /endpoints=([a-zA-Z0-9:\/\.\-_]+)$/;
    let parts = {
      utxo: null,
      assetId: null,
      assetType: null,
      expiry: null,
      endpoints: null,
    };
    parts.utxo = _invoice.match(utxoPattern)?.[0] || null;
    parts.assetId = _invoice.match(assetIdPattern)?.[1] || '';
    parts.assetType = _invoice.match(assetTypePattern)?.[1] || '';
    parts.expiry = _invoice.match(expiryPattern)?.[1] || null;
    parts.endpoints = _invoice.match(endpointPattern)?.[1] || null;
    return parts;
  };

  const sendAsset = useCallback(async () => {
    try {
      const { utxo, endpoints } = decodeInvoice(invoice);
      setLoading(true);
      const response = await ApiHandler.sendAsset({
        assetId,
        blindedUTXO: utxo,
        amount: parseFloat(assetAmount && assetAmount.replace(/,/g, '')),
        consignmentEndpoints: endpoints,
        feeRate: selectedFeeRate,
        isDonation,
      });
      if (response?.txid) {
        setLoading(false);
        setSuccessStatus(true);
        // Toast(sendScreen.sentSuccessfully, true);
      } else if (response?.error === 'Insufficient sats for RGB') {
        setTimeout(() => {
          createUtxos.mutate();
        }, 500);
      } else if (response?.error) {
        setVisible(false);
        setTimeout(() => {
          if (
            response?.error ===
            'details=Error from bdk: UTXO not found in the internal database'
          ) {
            Toast(
              'We encountered an issue while syncing your UTXOs. Please refresh your wallet from the Home screen and try again. Contact support on Telegram if needed.',
              true,
            );
          } else {
            Toast(`Failed: ${response?.error}`, true);
          }
        }, 500);
      }
    } catch (error) {
      setVisible(false);
      setTimeout(() => {
        Toast(`Failed: ${error}`, true);
      }, 500);
      console.log(error);
    }
  }, [invoice, assetAmount, navigation, isDonation]);

  const handlePasteAddress = async () => {
    try {
      setValidatingInvoiceLoader(true);
      const clipboardValue = await Clipboard.getString();
      console.log('clipboardValue', clipboardValue);
      if (!clipboardValue) {
        Toast('Clipboard is empty. Please copy a valid invoice.', true);
        setValidatingInvoiceLoader(false);
        return;
      }
      const res = await ApiHandler.decodeInvoice(clipboardValue);
      if (res.assetId) {
        const assetData = allAssets.find(item => item.assetId === res.assetId);
        if (!assetData || res.assetId !== assetId) {
          setValidatingInvoiceLoader(false);
          setInvoiceValidationError(assets.invoiceMisamatchMsg);
        } else if (res.assetId && res.assetId === assetId) {
          setInvoice(clipboardValue);
          setAssetAmount(res.amount.toString() || 0);
          setValidatingInvoiceLoader(false);
          setInvoiceValidationError('');
        } else {
          setInvoice(clipboardValue);
          setValidatingInvoiceLoader(false);
          setInvoiceValidationError('');
        }
      } else if (res.recipientId) {
        setInvoice(clipboardValue);
        setValidatingInvoiceLoader(false);
        setInvoiceValidationError('');
      }
    } catch (error) {
      setInvoiceValidationError('Invalid invoice');
      setValidatingInvoiceLoader(false);
    }
  };

  const handleInvoiceInputChange = async text => {
    try {
      const res = await ApiHandler.decodeInvoice(text);
      if (res.assetId) {
        const assetData = allAssets.find(item => item.assetId === res.assetId);
        if (!assetData || res.assetId !== assetId) {
          setInvoiceValidationError(assets.invoiceMisamatchMsg);
        } else if (res.assetId && res.assetId === assetId) {
          setInvoice(text);
          setAssetAmount(res.amount.toString() || 0);
          setInvoiceValidationError('');
        } else {
          setInvoice(text);
          setInvoiceValidationError('');
        }
      } else if (res.recipientId) {
        setInvoice(text);
        setInvoiceValidationError('');
      } else {
        setInvoice(text);
        setInvoiceValidationError('Invalid invoice');
      }
    } catch (error) {
      setInvoiceValidationError('Invalid invoice');
      setValidatingInvoiceLoader(false);
    }
  };

  const setMaxAmount = () => {
    if (assetData?.balance?.spendable) {
      const spendableAmount = assetData.balance.spendable.toString();
      setAssetAmount(spendableAmount);
    }
  };

  const handleCustomFeeInput = text => {
    const isValidNumber = /^\d*\.?\d*$/.test(text);
    if (text.startsWith('0') && !text.startsWith('0.')) {
      setCustomFee(text.replace(/^0+/, ''));
      setCustomAmtValidationError(sendScreen.validationZeroNotAllowed);
      return;
    }
    const numericValue = parseFloat(text);
    if (!isValidNumber || isNaN(numericValue) || numericValue < 1) {
      setCustomFee(0);
      return;
    }
    setCustomAmtValidationError('');
    setSelectedFeeRate(Number(text));
    setCustomFee(text);
  };

  return (
    <ScreenContainer>
      <AppHeader title={assets.sendAssetTitle} subTitle={''} />
      {/* <View>
        <ResponsePopupContainer
          visible={loading || createUtxos.isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.sendAssetLoadingTitle}
            subTitle={assets.sendAssetLoadingSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/sendingBTCorAsset.json')
                : require('src/assets/images/jsons/sendingBTCorAsset_light.json')
            }
          />
        </ResponsePopupContainer>
      </View> */}
      <View>
        <ModalLoading visible={validatingInvoiceLoader} />
      </View>
      <KeyboardAvoidView style={styles.container}>
        <AssetItem
          name={assetData?.name}
          details={
            assetData?.assetIface.toUpperCase() !== AssetFace.RGB25
              ? assetData?.ticker
              : assetData?.details
          }
          image={
            assetData.assetIface.toUpperCase() !== AssetFace.RGB20
              ? Platform.select({
                  android: `file://${
                    assetData.media?.filePath || assetData?.token.media.filePath
                  }`,
                  ios:
                    assetData.media?.filePath ||
                    assetData?.token.media.filePath,
                })
              : null
          }
          tag={
            assetData?.assetIface.toUpperCase() === AssetFace.RGB20
              ? assets.coin
              : assets.collectible
          }
          assetId={assetId}
          amount={assetData?.balance.spendable}
        />
        <AppText variant="body2" style={styles.labelstyle}>
          {sendScreen.recipientInvoice}
        </AppText>
        <TextField
          value={invoice}
          onChangeText={handleInvoiceInputChange}
          placeholder={assets.invoice}
          style={styles.input}
          multiline={true}
          returnKeyType={'Enter'}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          numberOfLines={3}
          contentStyle={invoice ? styles.contentStyle : styles.contentStyle1}
          inputStyle={styles.inputStyle}
          rightText={!invoice && sendScreen.paste}
          rightIcon={
            invoice && isThemeDark ? <ClearIcon /> : <ClearIconLight />
          }
          onRightTextPress={() =>
            invoice ? setInvoice('') : handlePasteAddress()
          }
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.accent1}
          error={invoiceValidationError}
          onBlur={() => setInvoiceValidationError('')}
        />
        <AppText variant="body2" style={styles.labelstyle}>
          {sendScreen.enterAmount}
        </AppText>
        <TextField
          value={formatNumber(assetAmount)}
          onChangeText={handleAmountInputChange}
          placeholder={assets.amount}
          keyboardType="numeric"
          style={styles.input}
          inputStyle={styles.inputStyle}
          rightText={common.max}
          onRightTextPress={setMaxAmount}
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.accent1}
          disabled={assetData.assetIface.toUpperCase() === AssetFace.RGB21}
          error={amountValidationError}
        />
        <AppText variant="body2" style={styles.labelstyle}>
          {sendScreen.fee}
        </AppText>
        <View style={styles.feeContainer}>
          <FeePriorityButton
            title={sendScreen.low}
            priority={TxPriority.LOW}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedFeeRate(averageTxFee[TxPriority.LOW].feePerByte);
              setSelectedPriority(TxPriority.LOW);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.LOW)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.LOW,
            )}
            disabled={false}
          />
          <FeePriorityButton
            title={sendScreen.medium}
            priority={TxPriority.MEDIUM}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedFeeRate(averageTxFee[TxPriority.MEDIUM].feePerByte);
              setSelectedPriority(TxPriority.MEDIUM);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.MEDIUM)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.MEDIUM,
            )}
            disabled={false}
          />
          <FeePriorityButton
            title={sendScreen.high}
            priority={TxPriority.HIGH}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedFeeRate(averageTxFee[TxPriority.HIGH].feePerByte);
              setSelectedPriority(TxPriority.HIGH);
            }}
            feeRateByPriority={getFeeRateByPriority(TxPriority.HIGH)}
            estimatedBlocksByPriority={getEstimatedBlocksByPriority(
              TxPriority.HIGH,
            )}
            disabled={false}
          />
          <FeePriorityButton
            title={sendScreen.custom}
            priority={TxPriority.CUSTOM}
            selectedPriority={selectedPriority}
            setSelectedPriority={() => {
              setSelectedPriority(TxPriority.CUSTOM);
            }}
            feeRateByPriority={''}
            estimatedBlocksByPriority={1}
            disabled={false}
          />
        </View>
        {selectedPriority === TxPriority.CUSTOM && (
          <View style={styles.inputWrapper}>
            <AppText variant="body2" style={styles.labelstyle}>
              {sendScreen.customFee}
            </AppText>
            <TextField
              value={customFee}
              onChangeText={handleCustomFeeInput}
              placeholder={sendScreen.enterCustomFee}
              keyboardType={'numeric'}
              inputStyle={styles.customFeeInputStyle}
              contentStyle={styles.feeInputContentStyle}
              rightText={'sat/vB'}
              onRightTextPress={() => {}}
              rightCTATextColor={theme.colors.headingColor}
              error={customAmtValidationError}
              onSubmitEditing={() => {
                setCustomAmtValidationError('');
              }}
            />
          </View>
        )}

        <View style={styles.containerSwitch}>
          <AppText variant="heading3">Send as donation?</AppText>

          <Switch
            value={isDonation}
            onValueChange={value => setIsDonation(value)}
            color={theme.colors.accent1}
          />
        </View>

        <ModalContainer
          title={
            successStatus
              ? sendScreen.successTitle
              : sendScreen.sendConfirmation
          }
          subTitle={!successStatus ? sendScreen.sendConfirmationSubTitle : ''}
          visible={visible}
          enableCloseIcon={false}
          onDismiss={() => {
            if (loading || successStatus) return;
            setVisible(false);
          }}>
          <SendAssetSuccess
            // transID={idx(sendTransactionMutation, _ => _.data.txid) || ''}
            assetName={assetData?.name}
            amount={assetAmount && assetAmount.replace(/,/g, '')}
            feeRate={
              selectedPriority === TxPriority.CUSTOM
                ? customFee
                : getFeeRateByPriority(selectedPriority)
            }
            selectedPriority={selectedPriority}
            onSuccessStatus={successStatus}
            onSuccessPress={() => {
              navigation.goBack();
              navigation.setParams({ askReview: true });
            }}
            onPress={sendAsset}
            estimateBlockTime={
              selectedPriority === TxPriority.CUSTOM
                ? 1
                : getEstimatedBlocksByPriority(selectedPriority)
            }
          />
        </ModalContainer>
      </KeyboardAvoidView>
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.next}
          primaryOnPress={() => {
            if (Number(assetAmount) > assetData?.balance.spendable) {
              Keyboard.dismiss();
              if (Number(assetData?.balance.spendable) === 0) {
                setAmountValidationError(
                  sendScreen.spendableBalanceMsg + assetData?.balance.spendable,
                );
                return;
              }
              setAmountValidationError(
                assets.checkSpendableAmt + assetData?.balance.spendable,
              );
              return;
            }
            Keyboard.dismiss();
            setVisible(true);
          }}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={
            isButtonDisabled ||
            createUtxos.isLoading ||
            loading ||
            amountValidationError.length > 0 ||
            customAmtValidationError.length > 0 ||
            invoiceValidationError.length > 0
          }
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    input: {
      // marginVertical: hp(10),
    },
    inputStyle: {
      width: '80%',
    },
    invoiceInputStyle: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    contentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
    },
    buttonWrapper: {
      marginVertical: hp(5),
    },
    assetItemWrapper: {
      flexDirection: 'row',
      width: '100%',
      padding: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      alignItems: 'center',
      borderRadius: 15,
      height: hp(70),
      marginBottom: hp(10),
    },
    imageStyle: {
      height: hp(50),
      width: hp(50),
      borderRadius: 10,
    },
    assetDetailsWrapper: {
      width: '37%',
      paddingLeft: hp(20),
    },
    amountWrapper: {
      width: '48%',
      alignItems: 'flex-end',
    },
    identiconWrapper: {
      width: '15%',
      height: '100%',
      justifyContent: 'center',
    },
    identiconView: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    amountTextWrapper: {
      paddingHorizontal: hp(10),
      paddingVertical: hp(3),
      borderRadius: 10,
    },
    amountText: {
      // color: theme.colors.headingColor,
      color: Colors.Black,
    },
    nameText: {
      color: theme.colors.secondaryHeadingColor,
    },
    labelstyle: {
      marginTop: hp(15),
      marginBottom: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    inputWrapper: {
      paddingBottom: 16,
    },
    feeContainer: {
      flexDirection: 'row',
    },
    customFeeInputStyle: {
      width: '80%',
    },
    feeInputContentStyle: {
      marginTop: 0,
    },
    rightCTAStyle: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerSwitch: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(15),
      paddingBottom: hp(30),
    },
  });

export default SendAssetScreen;
