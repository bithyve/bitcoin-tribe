import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import {
  AssetType,
  RgbUnspent,
  RGBWallet,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { formatNumber, numberWithCommas } from 'src/utils/numberWithCommas';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from './components/FailedToCreatePopupContainer';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Slider from 'src/components/Slider';
import { AppContext } from 'src/contexts/AppContext';
import { events, logCustomEvent } from 'src/services/analytics';

const MAX_ASSET_SUPPLY_VALUE = BigInt('18446744073709551615'); // 2^64 - 1 as BigInt

function IssueScreen() {
  const { issueAssetType, addToRegistry } = useRoute().params;
  const { isWalletOnline } = useContext(AppContext);
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations, formatString } = useContext(LocalizationContext);
  const { home, common, assets, wallet: walletTranslation } = translations;
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [precision, setPrecision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [assetNameValidationError, setAssetNameValidationError] = useState('');
  const [assetTickerValidationError, setAssetTickerValidationError] =
    useState('');
  const [assetTotSupplyValidationError, setAssetTotSupplyValidationError] =
    useState('');
  const [visibleFailedToCreatePopup, setVisibleFailedToCreatePopup] =
    useState(false);

  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
  } = useMutation(ApiHandler.createUtxos);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const viewUtxos = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWalletMutation = useMutation(ApiHandler.refreshRgbWallet);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const assetTickerInputRef = useRef(null);
  const totalSupplyInputRef = useRef(null);

  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo =>
      utxo.utxo.colorable === true &&
      utxo.rgbAllocations?.length === 0 &&
      utxo.pendingBlinded === 0,
  );

  useEffect(() => {
    if (createUtxoData) {
      setLoading(true);
      setTimeout(onPressIssue, 500);
    } else if (createUtxoError) {
      setLoading(false);
      createUtxoReset();
      refreshRgbWalletMutation.mutate();
      fetchUTXOs();
      navigation.goBack();
      if( createUtxoError.toString().includes('Insufficient sats for RGB')){
        Toast(formatString(assets.insufficientSats, { amount: 2000 }), true);
      } else {
        Toast(assets.assetProcessErrorMsg, true);
      }
    } else if (createUtxoData === false) {
      Toast(walletTranslation.failedToCreateUTXO, true);
      navigation.goBack();
    }
  }, [createUtxoData, createUtxoError]);

  useEffect(() => {
    viewUtxos.mutate();
  }, []);

  const totalSupplyWithPrecision = useMemo(() => {
    const supply = Number(String(totalSupplyAmt).replace(/,/g, '')) || 0;
    const decimals = Number(precision) || 0;
    return `${numberWithCommas(supply)} ${assetTicker}`;
  }, [totalSupplyAmt, precision, assetTicker]);

  const issueCoin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await ApiHandler.issueNewCoin({
        name: assetName.trim(),
        ticker: assetTicker,
        supply: totalSupplyAmt.replace(/,/g, '') + '0'.repeat(precision),
        precision: Number(precision),
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        // navigation.dispatch(popAction);
        logCustomEvent(events.CREATED_NIA);
        setTimeout(() => {
          if (!addToRegistry) {
            navigation.replace(NavigationRoutes.ASSETREGISTRYSCREEN, {
              assetId: response.assetId,
              askVerify: addToRegistry,
              issueType: AssetType.Coin,
            });
          } else {
            navigation.replace(NavigationRoutes.COINDETAILS, {
              assetId: response.assetId,
              askReview: true,
              askVerify: addToRegistry,
            });
          }
        }, 500);
      } else if (
        response?.error === 'Insufficient sats for RGB' ||
        response?.name === 'NoAvailableUtxos'
      ) {
        setTimeout(() => {
          createUtxos();
        }, 500);
      } else if (response?.error) {
        setLoading(false);
        Toast(`Failed: ${response?.error}`, true);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [assetName, assetTicker, navigation, totalSupplyAmt, precision]);

  const isButtonDisabled = useMemo(() => {
    if (
      isWalletOnline === WalletOnlineStatus.Error ||
      isWalletOnline === WalletOnlineStatus.InProgress
    ) {
      return true;
    }
    return !assetName || !assetTicker || !totalSupplyAmt;
  }, [assetName, assetTicker, totalSupplyAmt]);

  const onPressIssue = () => {
    issueCoin();
  };

  const handleAssetNameChange = text => {
    if (!text.trim()) {
      setAssetName('');
      setAssetNameValidationError(assets.enterAssetName);
    } else {
      setAssetName(text);
      setAssetNameValidationError(null);
    }
  };

  const handleAssetNameSubmit = () => {
    if (!assetName.trim()) {
      setAssetNameValidationError(assets.enterAssetName);
    } else {
      assetTickerInputRef.current?.focus();
    }
  };

  const handleAssetTickerInput = text => {
    if (!text.trim()) {
      setAssetTicker('');
      setAssetTickerValidationError(assets.enterAssetTicker);
    } else {
      setAssetTicker(text.trim().toUpperCase());
      setAssetTickerValidationError(null);
    }
  };

  const handleAssetTickerSubmit = () => {
    if (!assetTicker.trim()) {
      setAssetTickerValidationError(assets.enterAssetTicker);
    } else {
      totalSupplyInputRef.current?.focus();
    }
  };

  const handleTotalSupplyChange = text => {
    try {
      const sanitizedText = text.replace(/[^0-9]/g, '');
      if (
        sanitizedText &&
        BigInt(sanitizedText) * BigInt(10 ** precision) <=
          MAX_ASSET_SUPPLY_VALUE
      ) {
        setTotalSupplyAmt(sanitizedText);
        setAssetTotSupplyValidationError(null);
      } else if (!sanitizedText) {
        setTotalSupplyAmt('');
        setAssetTotSupplyValidationError(assets.enterTotalSupply);
      } else if (
        sanitizedText &&
        BigInt(sanitizedText) > MAX_ASSET_SUPPLY_VALUE
      ) {
        setAssetTotSupplyValidationError(assets.totalSupplyAmountErrMsg);
      }
    } catch {
      setTotalSupplyAmt('');
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={assets.issueNewCoin} />
      <View>
        <ResponsePopupContainer
          visible={loading || createUtxos.isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.issueAssetLoadingTitle}
            subTitle={assets.issueAssetLoadingSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/issuingAsset.json')
                : require('src/assets/images/jsons/issuingAsset_light.json')
            }
          />
        </ResponsePopupContainer>
      </View>

      <KeyboardAvoidView style={styles.contentWrapper}>
        <View>
          <AppText variant="body2" style={styles.textInputTitle}>
            {home.assetName}
          </AppText>
          <TextField
            value={assetName}
            onChangeText={handleAssetNameChange}
            placeholder={assets.enterAssetNamePlaceholder}
            maxLength={32}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={handleAssetNameSubmit}
            blurOnSubmit={false}
            error={assetNameValidationError}
          />
          <AppText variant="body2" style={styles.textInputTitle}>
            {home.assetTicker}
          </AppText>

          <TextField
            ref={assetTickerInputRef}
            value={assetTicker}
            onChangeText={handleAssetTickerInput}
            placeholder={assets.enterAssetTickerPlaceholder}
            maxLength={8}
            style={styles.input}
            autoCapitalize="characters"
            returnKeyType="next"
            onSubmitEditing={handleAssetTickerSubmit}
            blurOnSubmit={false}
            error={assetTickerValidationError}
          />

          <Slider
            title="Precision"
            value={precision}
            onValueChange={value => {
              if (
                BigInt(totalSupplyAmt) * BigInt(10 ** value) >
                MAX_ASSET_SUPPLY_VALUE
              ) {
                Toast(assets.totalSupplyAmountErrMsg, true);
                return;
              }
              setPrecision(value);
            }}
            minimumValue={0}
            maximumValue={10}
            step={1}
          />
          <AppText variant="caption" style={styles.textInputTitle}>
            {assets.precisionCaption}
          </AppText>

          <AppText variant="body2" style={styles.textInputTitle}>
            {home.totalSupplyAmount}
          </AppText>

          <TextField
            ref={totalSupplyInputRef}
            value={formatNumber(totalSupplyAmt)}
            onChangeText={text => handleTotalSupplyChange(text)}
            placeholder={assets.enterTotSupplyPlaceholder}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            error={assetTotSupplyValidationError}
          />
          <View style={styles.totalSupplyWrapper}>
            <AppText variant="body2" style={styles.textInputTitle}>
              Total Supply:
            </AppText>
            <AppText variant="body2" style={styles.textTotalSupply}>
              {totalSupplyWithPrecision}
            </AppText>
          </View>
        </View>
      </KeyboardAvoidView>
      {colorable.length === 0 && (
        <View style={styles.reservedSatsWrapper}>
          <View style={styles.checkIconWrapper}>
            {isThemeDark ? <CheckIcon /> : <CheckIconLight />}
          </View>
          <View style={styles.reservedSatsWrapper1}>
            <AppText variant="body2" style={styles.reservedSatsText}>
              {assets.reservedSats}
            </AppText>
          </View>
        </View>
      )}
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={onPressIssue}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled || createUtxos.isLoading || loading}
          width={windowWidth / 2.3}
          secondaryCTAWidth={windowWidth / 2.3}
          primaryLoading={createUtxos.isLoading || loading}
        />
      </View>
      <View>
        <ResponsePopupContainer
          visible={visibleFailedToCreatePopup}
          enableClose={true}
          onDismiss={() => setVisibleFailedToCreatePopup(false)}
          backColor={theme.colors.cardGradient1}
          borderColor={theme.colors.borderColor}>
          <FailedToCreatePopupContainer
            primaryOnPress={() => {
              setVisibleFailedToCreatePopup(false);
            }}
            secondaryOnPress={() => setVisibleFailedToCreatePopup(false)}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    buttonWrapper: {
      // marginTop: hp(20),
    },
    contentWrapper: {
      flex: 1,
    },
    segmentedButtonsStyle: {
      backgroundColor: theme.colors.primaryBackground,
      borderBottomColor: 'white',
      borderBottomWidth: 1,
    },
    imageStyle: {
      height: hp(110),
      width: hp(110),
      borderRadius: hp(15),
      marginVertical: hp(10),
    },
    imageWrapper: {
      flex: 1,
      position: 'relative',
    },
    closeIconWrapper: {
      position: 'absolute',
      bottom: 0,
      left: Platform.OS === 'ios' ? 100 : 112,
    },
    reservedSatsWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(20),
    },
    checkIconWrapper: {
      width: '10%',
    },
    reservedSatsWrapper1: {
      width: '90%',
    },
    reservedSatsText: {
      color: theme.colors.secondaryHeadingColor,
    },
    textInputTitle: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(5),
      marginBottom: hp(3),
    },
    totalSupplyWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textTotalSupply: {
      color: theme.colors.accent1,
      marginLeft: hp(10),
    },
  });
export default IssueScreen;
