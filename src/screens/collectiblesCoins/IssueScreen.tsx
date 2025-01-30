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
import AppHeader from 'src/components/AppHeader';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { RgbUnspent, RGBWallet } from 'src/models/interfaces/RGBWallet';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { formatNumber } from 'src/utils/numberWithCommas';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from './components/FailedToCreatePopupContainer';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Slider from 'src/components/Slider';

const MAX_ASSET_SUPPLY_VALUE = BigInt('9007199254740992'); // 2^64 - 1 as BigInt

function IssueScreen() {
  const { issueAssetType, addToRegistry } = useRoute().params;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { home, common, assets, wallet: walletTranslation } = translations;
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [precision, setPrecision] = useState(0);
  const [loading, setLoading] = useState(false);

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
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
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
      Toast(
        'An issue occurred while processing your request. Please try again.',
        true,
      );
    } else if (createUtxoData === false) {
      Toast(walletTranslation.failedToCreateUTXO, true);
      navigation.goBack();
    }
  }, [createUtxoData, createUtxoError]);

  useEffect(() => {
    viewUtxos.mutate();
  }, []);

  const issueCoin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await ApiHandler.issueNewCoin({
        name: assetName.trim(),
        ticker: assetTicker,
        supply: totalSupplyAmt.replace(/,/g, ''),
        precision: Number(precision),
        addToRegistry,
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        // navigation.dispatch(popAction);
        navigation.navigate(NavigationRoutes.ASSETS);
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
    return !assetName || !assetTicker || !totalSupplyAmt;
  }, [assetName, assetTicker, totalSupplyAmt]);

  const onPressIssue = () => {
    issueCoin();
  };

  const handleTotalSupplyChange = text => {
    try {
      const sanitizedText = text.replace(/[^0-9]/g, '');
      if (sanitizedText && BigInt(sanitizedText) <= MAX_ASSET_SUPPLY_VALUE) {
        setTotalSupplyAmt(sanitizedText);
      } else if (!sanitizedText) {
        setTotalSupplyAmt('');
      } else if (
        sanitizedText &&
        BigInt(sanitizedText) > MAX_ASSET_SUPPLY_VALUE
      ) {
        Toast(assets.totalSupplyAmountErrMsg, true);
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
          <AppText variant="secondaryCta" style={styles.textInputTitle}>
            {home.assetName}
          </AppText>
          <TextField
            value={assetName}
            onChangeText={text => setAssetName(text)}
            placeholder={assets.enterAssetNamePlaceholder}
            maxLength={32}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => assetTickerInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <AppText variant="secondaryCta" style={styles.textInputTitle}>
            {home.assetTicker}
          </AppText>

          <TextField
            ref={assetTickerInputRef}
            value={assetTicker}
            onChangeText={text => setAssetTicker(text.trim().toUpperCase())}
            placeholder={assets.enterAssetTickerPlaceholder}
            maxLength={8}
            style={styles.input}
            autoCapitalize="characters"
            returnKeyType="next"
            onSubmitEditing={() => totalSupplyInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <AppText variant="secondaryCta" style={styles.textInputTitle}>
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
          />

          <Slider
            title="Precision"
            value={precision}
            onValueChange={value => setPrecision(value)}
            minimumValue={0}
            maximumValue={10}
            step={1}
          />
          <AppText variant="secondaryCta" style={styles.textInputTitle}>
            {assets.precisionCaption}
          </AppText>
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
          width={wp(120)}
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
  });
export default IssueScreen;
