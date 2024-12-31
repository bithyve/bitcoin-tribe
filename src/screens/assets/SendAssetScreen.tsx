import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useMutation } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';
// import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { AssetFace } from 'src/models/interfaces/RGBWallet';
import { TxPriority } from 'src/services/wallets/enums';
import { Keys } from 'src/storage';
import AssetChip from 'src/components/AssetChip';
import Capitalize from 'src/utils/capitalizeUtils';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import SendSuccessPopupContainer from './components/SendSuccessPopupContainer';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';
import { formatNumber } from 'src/utils/numberWithCommas';
import config from 'src/utils/config';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import Identicon from 'src/components/Identicon';

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
  const styles = React.useMemo(() => getStyles(theme, 100), [theme]);

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
                tag === 'COIN' ? theme.colors.accent : theme.colors.accent2,
            }}>
            {name}
          </AppText>
          <AppText numberOfLines={1} variant="body2" style={styles.nameText}>
            {details}
          </AppText>
        </View>
        <View style={styles.tagWrapper}>
          <AssetChip
            tagText={Capitalize(tag)}
            backColor={
              tag === 'COIN' ? theme.colors.accent5 : theme.colors.accent4
            }
            tagColor={theme.colors.tagText}
          />
        </View>
        <View style={styles.amountWrapper}>
          <AppText variant="smallCTA" style={styles.amountText}>
            {amount}
          </AppText>
        </View>
      </GradientView>
    </AppTouchable>
  );
};

const SendAssetScreen = () => {
  const { assetId, rgbInvoice, wallet, item } = useRoute().params;
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

  const [invoice, setInvoice] = useState(rgbInvoice || '');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = React.useState(100);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );
  const [selectedFeeRate, setSelectedFeeRate] = React.useState(
    averageTxFee[TxPriority.LOW].feePerByte,
  );
  const styles = getStyles(theme, inputHeight);
  const isButtonDisabled = useMemo(() => {
    return !invoice || !amount;
  }, [invoice, amount]);

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

  useEffect(() => {
    if (item.balance.spendable < amount) {
      Toast(assets.checkSpendableAmt + item.balance.spendable, true);
    }
  }, [amount]);

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
      Keyboard.dismiss();
      const { utxo, endpoints } = decodeInvoice(invoice);
      setLoading(true);
      const response = await ApiHandler.sendAsset({
        assetId,
        blindedUTXO: utxo,
        amount,
        consignmentEndpoints: endpoints,
        feeRate: selectedFeeRate,
      });
      setLoading(false);
      if (response?.txid) {
        setTimeout(() => {
          setVisible(true);
        }, 500);
        // Toast(sendScreen.sentSuccessfully, true);
      } else if (response?.error === 'Insufficient sats for RGB') {
        setTimeout(() => {
          createUtxos.mutate();
        }, 500);
      } else if (response?.error) {
        Toast(`Failed: ${response?.error}`, true);
      }
    } catch (error) {
      console.log(error);
    }
  }, [invoice, amount, navigation]);

  return (
    <ScreenContainer>
      <AppHeader title={assets.sendAssetTitle} subTitle={''} />
      <View>
        <ResponsePopupContainer
          visible={loading || createUtxos.isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.sendAssetLoadingTitle}
            subTitle={assets.sendAssetLoadingSubTitle}
            illustrationPath={isThemeDark ? require('src/assets/images/jsons/sendingBTCorAsset.json') : require('src/assets/images/jsons/sendingBTCorAsset_light.json')}
          />
        </ResponsePopupContainer>
      </View>
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          setTimeout(() => {
            createUtxos.mutate();
          }, 500);
          // navigation.navigate(NavigationRoutes.RGBCREATEUTXO, {
          //   refresh: () => sendAsset(),
          // });
        }}
      />
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          onDismiss={() => setVisible(false)}
          backColor={theme.colors.successPopupBackColor}
          borderColor={theme.colors.successPopupBorderColor}
          conatinerModalStyle={styles.containerModalStyle}>
          <SendSuccessPopupContainer
            title={assets.success}
            subTitle={assets.operationSuccess}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </ResponsePopupContainer>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <AssetItem
          name={item.name}
          details={
            item.assetIface.toUpperCase() === AssetFace.RGB20
              ? item.ticker
              : item.details
          }
          image={
            item.media?.filePath
              ? Platform.select({
                  android: `file://${item.media?.filePath}`,
                  ios: item.media?.filePath,
                })
              : null
          }
          tag={
            item.assetIface.toUpperCase() === AssetFace.RGB20
              ? assets.coin
              : assets.collectible
          }
          assetId={assetId}
          amount={item.balance.spendable}
        />
        <TextField
          value={invoice}
          onChangeText={text => setInvoice(text)}
          placeholder={assets.invoice}
          style={[styles.input, invoice && styles.invoiceInputStyle]}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          multiline={true}
          returnKeyType={'Enter'}
          numberOfLines={5}
          contentStyle={invoice ? styles.contentStyle : styles.contentStyle1}
        />

        <TextField
          value={formatNumber(amount)}
          onChangeText={text => setAmount(text)}
          placeholder={assets.amount}
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.totalFeeWrapper}>
          <AppText variant="heading1" style={styles.feeTitleText}>
            {assets.feeRate}
          </AppText>
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
              onPress={() => {
                setSelectedPriority(TxPriority.LOW);
                setSelectedFeeRate(averageTxFee[TxPriority.LOW].feePerByte);
              }}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                {assets.low}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                {averageTxFee[TxPriority.LOW].feePerByte} sat/vB
              </AppText>
              {/* <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
              </AppText> */}
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
              onPress={() => {
                setSelectedPriority(TxPriority.MEDIUM);
                setSelectedFeeRate(averageTxFee[TxPriority.MEDIUM].feePerByte);
              }}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                {assets.medium}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;{averageTxFee[TxPriority.MEDIUM].feePerByte} sat/vB
              </AppText>
              {/* <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
              </AppText> */}
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
              onPress={() => {
                setSelectedPriority(TxPriority.HIGH);
                setSelectedFeeRate(averageTxFee[TxPriority.HIGH].feePerByte);
              }}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                {assets.high}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;{averageTxFee[TxPriority.HIGH].feePerByte} sat/vB
              </AppText>
              {/* <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
              </AppText> */}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.send}
          primaryOnPress={sendAsset}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled || createUtxos.isLoading || loading}
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
      marginVertical: hp(10),
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
      // marginTop: hp(5),
    },
    buttonWrapper: {
      marginTop: hp(5),
      bottom: 10,
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
      width: '20%',
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
    amountText: {
      color: theme.colors.headingColor,
    },
    nameText: {
      color: theme.colors.secondaryHeadingColor,
    },
    totalFeeWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(10),
    },
    feeWrapper: {
      width: '100%',
      marginVertical: hp(10),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(8),
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
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(5),
      marginLeft: hp(5),
    },
    feeTitleText: {
      color: theme.colors.headingColor,
      marginRight: hp(10),
    },
    tagWrapper: {
      width: '28%',
      alignItems: 'flex-end',
    },
    containerModalStyle: {
      // margin: 0,
      // padding: 10,
    },
  });

export default SendAssetScreen;
