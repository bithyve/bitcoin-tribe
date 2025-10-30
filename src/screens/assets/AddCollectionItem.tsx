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
import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import {
  ImageBackground,
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
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import {
  RgbUnspent,
  RGBWallet,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
import pickImage from 'src/utils/imagePicker';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import AppTouchable from 'src/components/AppTouchable';
import { Keys, Storage } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from 'src/screens/collectiblesCoins/components/FailedToCreatePopupContainer';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import UDACollectiblesInfoModal from 'src/screens/collectiblesCoins/components/UDACollectiblesInfoModal';
import DeepLinking, { DeepLinkFeature } from 'src/utils/DeepLinking';
import {
  MOCK_BANNER,
  MOCK_BANNER_LIGHT,
} from '../collectiblesCoins/IssueCollection';
import PencilRound from 'src/assets/images/pencil_round.svg';
import PencilRoundLight from 'src/assets/images/pencil_round_light.svg';
import { SizedBox } from 'src/components/SizedBox';
import PrimaryCTA from 'src/components/PrimaryCTA';
import ModalContainer from 'src/components/ModalContainer';
import { CreateCollectionConfirmation } from 'src/components/CollectionConfirmationModal';
import { ServiceFeeType } from 'src/models/interfaces/Transactions';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

function IssueCollectibleScreen() {
  const { collectionId } = useRoute().params;
  const { appType, isWalletOnline } = useContext(AppContext);
  const popAction = StackActions.pop(2);
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations, formatString } = useContext(LocalizationContext);
  const { home, common, assets, wallet: walletTranslation } = translations;
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [assetNameValidationError, setAssetNameValidationError] = useState('');
  const [assetDescValidationError, setAssetDescValidationError] = useState('');
  const [assetTickerValidationError, setAssetTickerValidationError] =
    useState('');

  const [visibleFailedToCreatePopup, setVisibleFailedToCreatePopup] =
    useState(false);
  const [visibleUDACollectiblesInfo, setVisibleUDACollectiblesInfo] =
    useState(false);
  const fees = JSON.parse(Storage.get(Keys.SERVICE_FEE) as string);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [image, setImage] = useState('');
  const wallet: Wallet = useWallets({}).wallets[0];
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
  const descriptionInputRef = useRef(null);

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
      if (createUtxoError.toString().includes('Insufficient sats for RGB')) {
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

  const issueUda = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      if (colorable.length === 0) {
        await ApiHandler.createUtxos();
      }
      const collection = dbManager.getObjectByPrimaryId(
        RealmSchema.Collection,
        '_id',
        collectionId,
      );
      const deepLinking = DeepLinking.buildUrl(
        DeepLinkFeature.COLLECTION_ITEM,
        {
          collectionId: collectionId,
          assetId: collection.assetId,
        },
      );
      const response = await ApiHandler.mintCollectionItem({
        collectionId: collectionId,
        name: assetName.trim(),
        details: description.trim() + ' ' + deepLinking,
        ticker: assetTicker,
        mediaFilePath: Platform.select({
          android:
            appType === AppType.NODE_CONNECT ||
            appType === AppType.SUPPORTED_RLN
              ? image.startsWith('file://')
                ? image
                : `file://${path}`
              : image.replace('file://', ''),
          ios: image.replace('file://', ''),
        }),
        attachmentsFilePaths: attachments.map(attachment =>
          Platform.select({
            android:
              appType === AppType.NODE_CONNECT ||
              appType === AppType.SUPPORTED_RLN
                ? attachment.startsWith('file://')
                  ? attachment
                  : `file://${path}`
                : attachment.replace('file://', ''),
            ios: attachment.replace('file://', ''),
          }),
        ),
      });
      setPaying(false);
      setShowPayment(false);
      if (response?.assetId) {
        setLoading(false);
        Toast('Collection UDA created successfully');

        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        navigation.goBack();
        // navigation.dispatch(popAction);
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
      setPaying(false);
      setShowPayment(false);
      setLoading(false);
      Toast(`Unexpected error: ${error.message}`, true);
    }
  }, [
    assetName,
    assets.assetCreateMsg,
    description,
    image,
    navigation,
    attachments,
  ]);

  const isButtonDisabled = useMemo(() => {
    if (
      isWalletOnline === WalletOnlineStatus.Error ||
      isWalletOnline === WalletOnlineStatus.InProgress
    ) {
      return true;
    }
    return (
      !assetName ||
      !assetTicker ||
      !description ||
      // !attachments?.length ||
      !image
    );
  }, [assetName, assetTicker, description, attachments?.length, image]);

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
    issueUda();
  };

  const payFees = async () => {
    setPaying(true);
    try {
      const fees = JSON.parse(Storage.get(Keys.SERVICE_FEE) as string);
      const totalFee = fees.collectionItemFee.fee;
      if (
        wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed <
        totalFee
      ) {
        setShowPayment(false);
        Toast(assets.insufficientBalance, true);
        return;
      }
      const feeDetails = {
        address: fees.collectionFee.address,
        fee: totalFee,
      };
      const response = await ApiHandler.payServiceFee({
        feeDetails,
        feeType: ServiceFeeType.MINT_COLLECTION_ITEM_FEE,
        collectionId: collectionId,
      });
      if (response.txid) {
        issueUda();
      }
    } catch (error) {
      setShowPayment(false);
      Toast(error.message, true);
      console.log(error);
      setPaying(false);
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

  const handleUniqueAssetDescriptionChange = text => {
    if (!text.trim()) {
      setDescription('');
      setAssetDescValidationError(assets.enterDescription);
    } else {
      setDescription(text);
      setAssetDescValidationError(null);
    }
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <AppHeader title={assets.issueUDA} style={styles.gutter} />
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
          <ImageBackground
            source={
              !image?.trim()
                ? isThemeDark
                  ? MOCK_BANNER
                  : MOCK_BANNER_LIGHT
                : {
                    uri:
                      Platform.OS === 'ios'
                        ? image.replace('file://', '')
                        : image,
                  }
            }
            resizeMode="cover"
            style={styles.bannerImage}>
            <AppTouchable onPress={handlePickImage} style={styles.pencilIcon}>
              {isThemeDark ? <PencilRound /> : <PencilRoundLight />}
            </AppTouchable>
          </ImageBackground>
        </View>
        <SizedBox height={hp(10)} />
        <View style={styles.gutter}>
          <AppText variant="body2" style={styles.textInputTitle}>
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

          <AppText variant="body2" style={styles.textInputTitle}>
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

          <AppText variant="body2" style={styles.textInputTitle}>
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
            maxLength={200}
            multiline={true}
            numberOfLines={2}
            style={[styles.input, description && styles.descInput]}
            onSubmitEditing={() => Keyboard.dismiss()}
            blurOnSubmit={false}
            error={assetDescValidationError}
          />
        </View>

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
        <View style={[styles.buttonWrapper, styles.gutter]}>
          <PrimaryCTA
            title={assets.mintUDA}
            onPress={()=>setShowPayment(true)}
            width={'100%'}
            disabled={isButtonDisabled || createUtxos.isLoading || loading}
            height={hp(20)}
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
      <View>
        <UDACollectiblesInfoModal
          visible={visibleUDACollectiblesInfo}
          primaryCtaTitle={common.okay}
          primaryOnPress={() => setVisibleUDACollectiblesInfo(false)}
        />
      </View>

      <ModalContainer
        title={
          showSuccess
            ? assets.collectionPaymentConfirm
            : assets.collectionPayment
        }
        subTitle={
          showSuccess
            ? assets.collectionPaymentConfirmSubtitle
            : assets.collectionPaymentSubtitle
        }
        visible={showPayment}
        enableCloseIcon={false}
        onDismiss={() => !paying && setShowPayment(false)}>
        <CreateCollectionConfirmation
          showSuccess={showSuccess}
          onSwiped={payFees}
          baseFee={fees.collectionItemFee.fee}
          verificationFee={0}
          isVerification={false}
          closeModal={mode => {
            setShowPayment(false);
            setShowSuccess(false);
          }}
          singleFee={'Issue Fee'}
        />
      </ModalContainer>
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
      marginHorizontal:wp(16)
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
    totalSupplyWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textTotalSupply: {
      color: theme.colors.accent1,
      marginLeft: hp(10),
    },
    bannerImage: {
      height: hp(280),
    },
    pencilIcon: {
      position: 'absolute',
      right: hp(16),
      bottom: hp(16),
    },
    gutter: { paddingHorizontal: hp(16) },
  });
export default IssueCollectibleScreen;
