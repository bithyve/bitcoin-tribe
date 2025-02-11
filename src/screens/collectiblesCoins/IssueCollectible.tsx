import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Switch, useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import {
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import {
  AssetType,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import pickImage from 'src/utils/imagePicker';
import IconClose from 'src/assets/images/image_icon_close.svg';
import IconCloseLight from 'src/assets/images/image_icon_close_light.svg';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import UploadAssetFileButton from './components/UploadAssetFileButton';
import UploadFile from 'src/assets/images/uploadFile.svg';
import UploadFileLight from 'src/assets/images/uploadFile_light.svg';
import { formatNumber } from 'src/utils/numberWithCommas';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from './components/FailedToCreatePopupContainer';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Slider from 'src/components/Slider';
import AddMediaFile from 'src/assets/images/addMediaFile.svg';
import AddMediaFileLight from 'src/assets/images/addMediaFileLight.svg';

const MAX_ASSET_SUPPLY_VALUE = BigInt('9007199254740992'); // 2^64 - 1 as BigInt

function IssueCollectibleScreen() {
  const { issueAssetType, addToRegistry } = useRoute().params;
  const { appType } = useContext(AppContext);
  const popAction = StackActions.pop(2);
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { home, common, assets, wallet: walletTranslation } = translations;
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [description, setDescription] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [precision, setPrecision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [assetNameValidationError, setAssetNameValidationError] = useState('');
  const [assetDescValidationError, setAssetDescValidationError] = useState('');
  const [assetTickerValidationError, setAssetTickerValidationError] =
    useState('');
  const [assetTotSupplyValidationError, setAssetTotSupplyValidationError] =
    useState('');

  const [visibleFailedToCreatePopup, setVisibleFailedToCreatePopup] =
    useState(false);
  const [assetType, setAssetType] = useState<AssetType>(issueAssetType);
  const [image, setImage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
  } = useMutation(ApiHandler.createUtxos);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  // const createUtxos = useMutation(ApiHandler.createUtxos);
  const viewUtxos = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWalletMutation = useMutation(ApiHandler.refreshRgbWallet);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const assetTickerInputRef = useRef(null);
  const totalSupplyInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

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

  const issueCollectible = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await ApiHandler.issueNewCollectible({
        name: assetName.trim(),
        description: description,
        supply: totalSupplyAmt.replace(/,/g, ''),
        precision: Number(precision),
        filePath: Platform.select({
          android:
            appType === AppType.NODE_CONNECT
              ? image.startsWith('file://')
                ? image
                : `file://${path}`
              : image.replace('file://', ''),
          ios: image.replace('file://', ''),
        }),
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        // navigation.dispatch(popAction);
        setTimeout(() => {
          navigation.replace(NavigationRoutes.COLLECTIBLEDETAILS, { assetId: response.assetId, askReview: true });
        }, 700);
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
      Toast(`Unexpected error: ${error.message}`, true);
    }
  }, [
    assetName,
    assets.assetCreateMsg,
    description,
    image,
    navigation,
    totalSupplyAmt,
    precision,
  ]);

  const issueUda = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await ApiHandler.issueAssetUda({
        name: assetName.trim(),
        details: description,
        ticker: assetTicker,
        addToRegistry: addToRegistry,
        mediaFilePath: Platform.select({
          android:
            appType === AppType.NODE_CONNECT
              ? image.startsWith('file://')
                ? image
                : `file://${path}`
              : image.replace('file://', ''),
          ios: image.replace('file://', ''),
        }),
        attachmentsFilePaths: attachments.map(attachment =>
          Platform.select({
            android:
              appType === AppType.NODE_CONNECT
                ? attachment.startsWith('file://')
                  ? attachment
                  : `file://${path}`
                : attachment.replace('file://', ''),
            ios: attachment.replace('file://', ''),
          }),
        ),
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        // navigation.dispatch(popAction);
        setTimeout(() => {
          navigation.replace(NavigationRoutes.UDADETAILS, { assetId: response.assetId, askReview: true });
        }, 700);
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
      Toast(`Unexpected error: ${error.message}`, true);
    }
  }, [
    assetName,
    assets.assetCreateMsg,
    description,
    image,
    navigation,
    totalSupplyAmt,
    precision,
    attachments,
  ]);

  const isButtonDisabled = useMemo(() => {
    if (assetType === AssetType.Collectible) {
      return !assetName || !image || !totalSupplyAmt || !description;
    }
    return (
      !assetName ||
      !assetTicker ||
      !description ||
      !attachments?.length ||
      !image
    );
  }, [
    assetType,
    assetName,
    assetTicker,
    description,
    attachments?.length,
    image,
    totalSupplyAmt,
  ]);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const selectAttchments = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false, 5);
      if (result && result?.length) {
        setAttachments(result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onPressIssue = () => {
    if (assetType === AssetType.Collectible) {
      issueCollectible();
    } else {
      issueUda();
    }
  };

  const handleTabChange = () => {
    setDescription('');
    setAssetTicker('');
    setAssetName('');
    setTotalSupplyAmt('');
    setImage('');
    setAttachments([]);
    setPrecision(0);
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
      descriptionInputRef.current?.focus();
    }
  };
  const handleUniqueAssetNameChange = text => {
    if (!text.trim()) {
      setAssetName('');
      setAssetNameValidationError(assets.enterAssetName);
    } else {
      setAssetName(text);
      setAssetNameValidationError(null);
    }
  };
  const handleUniqueAssetNameSubmit = () => {
    if (!assetName.trim()) {
      setAssetNameValidationError(assets.enterAssetName);
    } else {
      assetTickerInputRef.current?.focus();
    }
  };
  const handleUniqueAssetTickerChange = text => {
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
      descriptionInputRef.current?.focus();
    }
  };

  const handleAssetDescriptionChange = text => {
    if (!text.trim()) {
      setDescription('');
      setAssetDescValidationError(assets.enterDescription);
    } else {
      setDescription(text);
      setAssetDescValidationError(null);
    }
  };

  const handleUniqueAssetDescriptionChange = text => {
    if (!text.trim()) {
      setDescription('');
      setAssetDescValidationError(assets.enterDescription);
    } else {
      setDescription(text);
      setAssetDescValidationError(null);
    }
  };

  const handleTotalSupplyChange = text => {
    try {
      const sanitizedText = text.replace(/[^0-9]/g, '');
      if (sanitizedText && BigInt(sanitizedText) <= MAX_ASSET_SUPPLY_VALUE) {
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
      <AppHeader title={assets.issueCollectibles} />
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
        <View style={styles.containerTop}>
          <AppText variant="heading3">{assets.makeCollectibleUnique}</AppText>
          <Switch
            value={assetType === AssetType.UDA}
            onValueChange={value => {
              setAssetType(value ? AssetType.UDA : AssetType.Collectible);
              handleTabChange();
            }}
            color={theme.colors.accent1}
          />
        </View>

        {assetType === AssetType.Collectible ? (
          <View>
            <AppText variant="secondaryCta" style={styles.textInputTitle}>
              {home.assetName}
            </AppText>
            <TextField
              value={assetName}
              onChangeText={handleAssetNameChange}
              placeholder={assets.enterAssetNamePlaceholder}
              maxLength={32}
              style={styles.input}
              autoCapitalize="words"
              onSubmitEditing={handleAssetNameSubmit}
              blurOnSubmit={false}
              returnKeyType="next"
              error={assetNameValidationError}
            />

            <AppText variant="secondaryCta" style={styles.textInputTitle}>
              {home.assetDescription}
            </AppText>
            <TextField
              ref={descriptionInputRef}
              value={description}
              onChangeText={handleAssetDescriptionChange}
              placeholder={assets.enterDescNamePlaceholder}
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              keyboardType={'default'}
              returnKeyType="next"
              maxLength={100}
              multiline={true}
              numberOfLines={2}
              style={[styles.input, description && styles.descInput]}
              onSubmitEditing={() => totalSupplyInputRef.current?.focus()}
              blurOnSubmit={false}
              error={assetDescValidationError}
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
              error={assetTotSupplyValidationError}
            />

            <Slider
              title={assets.precision}
              value={precision}
              onValueChange={value => setPrecision(value)}
              minimumValue={0}
              maximumValue={10}
              step={1}
            />
            <AppText variant="caption" style={styles.textInputTitle}>
              {assets.precisionCaption}
            </AppText>

            <AppText
              variant="secondaryCta"
              style={[styles.textInputTitle, { marginTop: 10 }]}>
              {assets.mediaFile}
            </AppText>

            <UploadAssetFileButton
              onPress={handlePickImage}
              title={home.uploadFile}
              icon={isThemeDark ? <UploadFile /> : <UploadFileLight />}
            />
            {image && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      Platform.OS === 'ios'
                        ? image.replace('file://', '')
                        : image,
                  }}
                  style={styles.imageStyle}
                />
                <AppTouchable
                  style={styles.closeIconWrapper}
                  onPress={() => setImage('')}>
                  {isThemeDark ? <IconClose /> : <IconCloseLight />}
                </AppTouchable>
              </View>
            )}

            <AppText variant="caption" style={[styles.textInputTitle]}>
              {assets.assetImageCaption}
            </AppText>
          </View>
        ) : (
          <View>
            <AppText variant="secondaryCta" style={styles.textInputTitle}>
              {home.assetName}
            </AppText>
            <TextField
              value={assetName}
              onChangeText={handleUniqueAssetNameChange}
              placeholder={assets.enterAssetNamePlaceholder}
              maxLength={32}
              style={styles.input}
              autoCapitalize="words"
              onSubmitEditing={handleUniqueAssetNameSubmit}
              blurOnSubmit={false}
              returnKeyType="next"
              error={assetNameValidationError}
            />

            <AppText variant="secondaryCta" style={styles.textInputTitle}>
              {home.assetTicker}
            </AppText>

            <TextField
              ref={assetTickerInputRef}
              value={assetTicker}
              onChangeText={handleUniqueAssetTickerChange}
              placeholder={assets.enterAssetTickerPlaceholder}
              maxLength={8}
              style={styles.input}
              autoCapitalize="characters"
              returnKeyType="next"
              onSubmitEditing={handleAssetTickerSubmit}
              blurOnSubmit={false}
              error={assetTickerValidationError}
            />

            <AppText variant="secondaryCta" style={styles.textInputTitle}>
              {home.assetDescription}
            </AppText>
            <TextField
              ref={descriptionInputRef}
              value={description}
              onChangeText={handleUniqueAssetDescriptionChange}
              placeholder={assets.enterDescNamePlaceholder}
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              keyboardType={'default'}
              returnKeyType="done"
              maxLength={100}
              multiline={true}
              numberOfLines={2}
              style={[styles.input, description && styles.descInput]}
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit={false}
              error={assetDescValidationError}
            />

            <AppText
              variant="secondaryCta"
              style={[styles.textInputTitle, { marginTop: 10 }]}>
              {assets.mediaFile}
            </AppText>

            {image ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      Platform.OS === 'ios'
                        ? image.replace('file://', '')
                        : image,
                  }}
                  style={styles.imageStyle}
                />
                <AppTouchable
                  style={styles.closeIconWrapper}
                  onPress={() => setImage('')}>
                  {isThemeDark ? <IconClose /> : <IconCloseLight />}
                </AppTouchable>
              </View>
            ) : (
              <AppTouchable
                onPress={handlePickImage}
                style={styles.addMediafileIconWrapper}>
                {isThemeDark ? <AddMediaFile /> : <AddMediaFileLight />}
              </AppTouchable>
            )}

            <AppText variant="caption" style={[styles.textInputTitle]}>
              {assets.assetImageCaption}
            </AppText>

            <AppText
              variant="secondaryCta"
              style={[styles.textInputTitle, { marginTop: 10 }]}>
              {assets.attachments}
            </AppText>

            <FlatList
              data={attachments}
              extraData={[attachments]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{
                      uri:
                        Platform.OS === 'ios'
                          ? item.replace('file://', '')
                          : item,
                    }}
                    style={styles.imageStyle}
                  />
                  <AppTouchable
                    style={styles.closeIconWrapper}
                    onPress={() => {
                      setAttachments(attachments.filter((_, i) => i !== index));
                    }}>
                    {isThemeDark ? <IconClose /> : <IconCloseLight />}
                  </AppTouchable>
                </View>
              )}
              ListFooterComponent={() => (
                <AppTouchable
                  onPress={selectAttchments}
                  style={[styles.selectAttatchmentIconWrapper]}>
                  {isThemeDark ? <AddMediaFile /> : <AddMediaFileLight />}
                </AppTouchable>
              )}
            />

            <AppText variant="caption" style={[styles.textInputTitle]}>
              {assets.attachmentsCaption}
            </AppText>
          </View>
        )}

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
      </KeyboardAvoidView>

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
      marginTop: hp(30),
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
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageWrapper: {
      flex: 1,
      position: 'relative',
    },
    closeIconWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 70,
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
    containerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(20),
    },
    addMediafileIconWrapper: {
      marginVertical: hp(5),
    },
    selectAttatchmentIconWrapper: {
      marginHorizontal: hp(5),
      marginVertical: hp(12),
    },
  });
export default IssueCollectibleScreen;
