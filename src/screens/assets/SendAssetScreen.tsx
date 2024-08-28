import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useCallback, useContext, useState, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RadioButton, useTheme } from 'react-native-paper';
import Identicon from 'react-native-identicon';
import { useMMKVString } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import SuccessPopupIcon from 'src/assets/images/successPopup.svg';
import { AssetFace } from 'src/models/interfaces/RGBWallet';
import { TxPriority } from 'src/services/wallets/enums';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useBalance from 'src/hooks/useBalance';
import { Keys } from 'src/storage';
import AssetChip from 'src/components/AssetChip';
import Capitalize from 'src/utils/capitalizeUtils';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import SendSuccessPopupContainer from './components/SendSuccessPopupContainer';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
} from 'src/services/wallets/interfaces';

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
            variant="body2"
            style={{
              color:
                tag === 'COIN' ? theme.colors.accent : theme.colors.accent2,
            }}>
            {name}
          </AppText>
          <AppText variant="body2" style={styles.nameText}>
            {details}
          </AppText>
        </View>
        <View style={styles.tagWrapper}>
          <AssetChip
            tagText={Capitalize(tag)}
            backColor={
              tag === 'COIN' ? theme.colors.accent2 : theme.colors.accent1
            }
            tagColor={theme.colors.primaryCTAText}
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
  const { sendScreen, common, assets } = translations;
  const [invoice, setInvoice] = useState(rgbInvoice || '');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = React.useState(100);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const { getBalance, getCurrencyIcon } = useBalance();
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [averageTxFeeJSON] = useMMKVString(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const averageTxFeeByNetwork: AverageTxFeesByNetwork =
    JSON.parse(averageTxFeeJSON);
  const averageTxFee: AverageTxFees = averageTxFeeByNetwork[wallet.networkType];

  const styles = getStyles(theme, inputHeight);
  const isButtonDisabled = useMemo(() => {
    return !invoice || !amount;
  }, [invoice, amount]);

  const sendAsset = useCallback(async () => {
    Keyboard.dismiss();
    const utxo = invoice.match(/~\/~\/([^?]+)\?/)[1];
    const endpoint = invoice.match(/endpoints=([^&]+)/)[1];
    setLoading(true);
    const response = await ApiHandler.sendAsset({
      assetId,
      blindedUTXO: utxo,
      amount,
      consignmentEndpoints: endpoint,
    });
    setLoading(false);
    if (response?.txid) {
      setVisible(true);
      // Toast(sendScreen.sentSuccessfully, true);
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`, false, true);
    }
  }, [invoice, amount, navigation]);

  const handleAmtChangeText = text => {
    const positiveNumberRegex = /^\d*[1-9]\d*$/;
    if (positiveNumberRegex.test(text)) {
      setAmount(text);
    } else {
      setAmount('');
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={assets.sendAssetTitle} subTitle={''} />
      <ModalLoading visible={loading} />
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          navigation.navigate(NavigationRoutes.RGBCREATEUTXO, {
            refresh: () => mutate(),
          });
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
            icon={<SuccessPopupIcon />}
            title={assets.success}
            subTitle={assets.operationSuccess}
            description={assets.operationSuccessSubTitle}
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
                  ios: `${item.media?.filePath}.${
                    item.media?.mime.split('/')[1]
                  }`,
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
          numberOfLines={5}
          contentStyle={invoice ? styles.contentStyle : styles.contentStyle1}
        />

        <TextField
          value={amount}
          onChangeText={handleAmtChangeText}
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
              onPress={() => setSelectedPriority(TxPriority.LOW)}
            />
            <View style={styles.feeViewWrapper}>
              <AppText variant="body2" style={styles.feePriorityText}>
                {assets.low}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                {/* &nbsp;1 sat/vbyte */}
                {averageTxFee[TxPriority.LOW].feePerByte} sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
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
                {assets.medium}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;{averageTxFee[TxPriority.MEDIUM].feePerByte} sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
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
                {assets.high}
              </AppText>
              <AppText variant="body2" style={styles.feeText}>
                &nbsp;{averageTxFee[TxPriority.HIGH].feePerByte} sat/vbyte
              </AppText>
              <AppText variant="caption" style={styles.feeSatsText}>
                ~10 min
              </AppText>
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
          disabled={isButtonDisabled}
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
      marginTop: hp(5),
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
