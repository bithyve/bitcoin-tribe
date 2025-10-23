import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import {
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RadioButton } from 'react-native-paper';
import pickImage from 'src/utils/imagePicker';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { formatNumber } from 'src/utils/numberWithCommas';
import AppTouchable from 'src/components/AppTouchable';
import { Keys, Storage } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from './components/FailedToCreatePopupContainer';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import UncheckIcon from 'src/assets/images/uncheckIcon.svg';
import UncheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PencilRound from 'src/assets/images/pencil_round.svg';
import PencilRoundLight from 'src/assets/images/pencil_round_light.svg';
import ModalContainer from 'src/components/ModalContainer';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { CreateCollectionConfirmation } from 'src/components/CollectionConfirmationModal';
import Toast from 'src/components/Toast';
import { ServiceFeeType } from 'src/models/interfaces/Transactions';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';
import { RgbUnspent, RGBWallet } from 'src/models/interfaces/RGBWallet';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import Colors from 'src/theme/Colors';
import { SizedBox } from 'src/components/SizedBox';

const MOCK_BANNER = require('src/assets/images/mockBanner.png');
const MOCK_BANNER_LIGHT = require('src/assets/images/mockBannerLight.png');
const MOCK_COLLECTION = require('src/assets/images/mockCollection.png');
const MOCK_COLLECTION_LIGHT = require('src/assets/images/mockCollectionLight.png');
const MAX_ASSET_SUPPLY_VALUE = BigInt('18446744073709551615'); // 2^64 - 1 as BigInt

function IssueCollection() {
  const insets = useSafeAreaInsets();
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { home, common, assets } = translations;
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight, insets);
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [precision, setPrecision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [collectionNameValidationError, setCollectionNameValidationError] =
    useState('');
  const [descValidationError, setDescValidationError] = useState('');
  const [assetTotSupplyValidationError, setAssetTotSupplyValidationError] =
    useState('');
  const [visibleFailedToCreatePopup, setVisibleFailedToCreatePopup] =
    useState(false);
  const [image, setImage] = useState('');
  const [collectionImage, setCollectionImage] = useState('');
  const [isFixedSupply, setisFixedSupply] = useState(true);
  const [isVerification, setIsVerification] = useState(false);
  const { mutate: createUtxos } = useMutation(ApiHandler.createUtxos);
  const viewUtxos = useMutation(ApiHandler.viewUtxos);
  const totalSupplyInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const fees = JSON.parse(Storage.get(Keys.SERVICE_FEE) as string);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const wallet: Wallet = useWallets({}).wallets[0];
  const { appType, isWalletOnline } = useContext(AppContext);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const navigation = useNavigation();
  const [collection, setCollection] = useState(null);
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
    viewUtxos.mutate();
  }, []);

  const isButtonDisabled = useMemo(() => {
    if (isFixedSupply) {
      return !collectionName || !description || !image || !totalSupplyAmt;
    } else {
      return !collectionName || !description || !image;
    }
  }, [collectionName, description, image, totalSupplyAmt, isFixedSupply]);

  const checkIcon = useMemo(() => {
    if (isThemeDark) {
      return isVerification ? <CheckIcon /> : <UncheckIcon />;
    }
    return isVerification ? <CheckIconLight /> : <UncheckIconLight />;
  }, [isVerification]);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePickCollectionImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setCollectionImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCollectionNameChange = text => {
    if (!text.trim()) {
      setCollectionName('');
      setCollectionNameValidationError(assets.enterCollectionName);
    } else {
      setCollectionName(text);
      setCollectionNameValidationError(null);
    }
  };
  const handleCollectionNameSubmit = () => {
    if (!collectionName.trim()) {
      setCollectionNameValidationError(assets.enterCollectionName);
    } else {
      descriptionInputRef.current?.focus();
    }
  };

  const handleCollectionDescriptionChange = text => {
    if (!text.trim()) {
      setDescription('');
      setDescValidationError(assets.enterCollectionDescription);
    } else {
      setDescription(text);
      setDescValidationError(null);
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

  const payFees = async () => {
    try {
      const fees = JSON.parse(Storage.get(Keys.SERVICE_FEE) as string);
      const totalFee = isVerification
        ? fees.issuanceFee.fee + fees.collectionFee.fee
        : fees.collectionFee.fee;
      if (
        wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed <
        totalFee
      ) {
        setShowPayment(false);
        Toast(
          assets.insufficientSatsForCollection.replace(
            '{amount}',
            `${colorable.length === 0 ? totalFee : totalFee + 2000}`,
          ),
          true,
        );
        return;
      }
      const feeDetails = {
        address: fees.collectionFee.address,
        fee: totalFee,
      };
      const response = await ApiHandler.payServiceFee({
        feeDetails,
        feeType: ServiceFeeType.CREATE_COLLECTION_FEE,
        collectionId: '',
      });
      if (response.txid) {
        // setShowSuccess(true);
        const collection = await ApiHandler.issueNewCollection({
          name: collectionName,
          ticker: 'TCOLP',
          details: description,
          totalSupplyAmt: parseInt(totalSupplyAmt),
          isFixedSupply: isFixedSupply,
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
          attachmentsFilePaths: [
            Platform.select({
              android:
                appType === AppType.NODE_CONNECT ||
                appType === AppType.SUPPORTED_RLN
                  ? collectionImage.startsWith('file://')
                    ? collectionImage
                    : `file://${path}`
                  : collectionImage.replace('file://', ''),
              ios: collectionImage.replace('file://', ''),
            }),
          ],
          createUtxos: colorable.length === 0 ? true : false,
        });
        if (collection?.assetId) {
          setShowSuccess(true);
          setCollection(collection);
        } else {
          setShowPayment(false);
          Toast(assets.failedToCreateCollection, true);
        }
      }
    } catch (error) {
      setShowPayment(false);
      Toast(error.message, true);
      console.log(error);
    }
  };

  return (
    <View style={styles.parentContainer}>
      <KeyboardAvoidView style={styles.contentWrapper}>
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
          style={styles.bannerImage}
          imageStyle={styles.bannerImageCtr}>
          <View style={styles.headerCtr}>
            <AppHeader title={assets.issueCollection} />
          </View>
          <AppTouchable onPress={handlePickImage} style={styles.pencilIcon}>
            {isThemeDark ? <PencilRound /> : <PencilRoundLight />}
          </AppTouchable>
        </ImageBackground>
        <Pressable onPress={handlePickCollectionImage} style={styles.imageCtr}>
          <Image
            source={
              !collectionImage?.trim()
                ? isThemeDark
                  ? MOCK_COLLECTION
                  : MOCK_COLLECTION_LIGHT
                : {
                    uri:
                      Platform.OS === 'ios'
                        ? collectionImage.replace('file://', '')
                        : collectionImage,
                  }
            }
            resizeMode="cover"
            style={styles.image}
          />
        </Pressable>

        <View style={styles.inputContainer}>
          <AppText variant="body2" style={styles.textInputTitle}>
            {assets.collectionName}
          </AppText>
          <TextField
            value={collectionName}
            onChangeText={handleCollectionNameChange}
            placeholder={assets.collectionNamePlaceholder}
            maxLength={32}
            style={styles.input}
            autoCapitalize="words"
            onSubmitEditing={handleCollectionNameSubmit}
            blurOnSubmit={false}
            returnKeyType="next"
            error={collectionNameValidationError}
          />

          <AppText variant="body2" style={styles.textInputTitle}>
            {assets.collectionDesc}
          </AppText>
          <TextField
            ref={descriptionInputRef}
            value={description}
            onChangeText={handleCollectionDescriptionChange}
            placeholder={assets.collectionDescPlaceholder}
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
            error={descValidationError}
          />

          <AppText variant="body2" style={styles.textInputTitle}>
            {assets.supplyPolicy}
          </AppText>
          <View style={styles.radioButtonWrapper}>
            <View style={styles.radioButtonContainer}>
              <RadioButton.Android
                value="fixed"
                status={isFixedSupply ? 'checked' : 'unchecked'}
                onPress={() => {
                  setisFixedSupply(true);
                }}
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
              />
              <AppText variant="heading3" style={styles.textRadioButton}>
                {assets.fixed}
              </AppText>
            </View>
            <View style={styles.radioButtonContainer}>
              <RadioButton.Android
                value="expandable"
                status={!isFixedSupply ? 'checked' : 'unchecked'}
                onPress={() => {
                  setisFixedSupply(false);
                }}
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
              />
              <AppText variant="heading3" style={styles.textRadioButton}>
                {assets.expandable}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" style={styles.textNote}>
            {assets.supplyPolicyNote}
          </AppText>
          <SizedBox height={hp(10)} />
          {isFixedSupply && (
            <View>
              <AppText variant="body2" style={styles.textInputTitle}>
                {assets.numberOfItems}
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
              <SizedBox height={hp(10)} />
            </View>
          )}

          <AppText variant="body2" style={styles.textInputTitle}>
            {assets.verificationOptional}
          </AppText>
          <View style={styles.verificationContainer}>
            <AppTouchable onPress={() => setIsVerification(!isVerification)}>
              {checkIcon}
            </AppTouchable>
            <AppText variant="body1" style={styles.textVerification}>
              {assets.issuerVerificationXDomain}
            </AppText>
          </View>
          <AppText variant="caption" style={styles.textNote}>
            {assets.verificationNote}
          </AppText>
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

        <View style={styles.buttonWrapper}>
          <PrimaryCTA
            title={common.proceed}
            onPress={() => setShowPayment(true)}
            width={'100%'}
            textColor={theme.colors.popupSentCTATitleColor}
            buttonColor={theme.colors.popupSentCTABackColor}
            height={hp(18)}
            disabled={isButtonDisabled}
          />
        </View>
      </KeyboardAvoidView>
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
        onDismiss={() => {
          setShowPayment(false);
        }}>
        <CreateCollectionConfirmation
          showSuccess={showSuccess}
          onSwiped={payFees}
          baseFee={fees.collectionFee.fee}
          verificationFee={fees.issuanceFee.fee}
          isVerification={isVerification}
          collection={collection}
          closeModal={mode => {
            setShowPayment(false);
            setShowSuccess(false);
            setTimeout(() => {
              if (mode === 'add') {
                navigation.replace(NavigationRoutes.COLLECTIONDETAILS, {
                  collectionId: collection._id,
                });
              } else {
                navigation.replace(NavigationRoutes.ADDCOLLECTIONITEM, {
                  collectionId: collection._id,
                });
              }
            }, 300);
          }}
        />
      </ModalContainer>

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
    </View>
  );
}

const getStyles = (theme: AppTheme, inputHeight, insets) =>
  StyleSheet.create({
    parentContainer: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
      paddingBottom: insets.bottom,
    },
    input: {
      marginVertical: hp(5),
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    buttonWrapper: {
      marginTop: hp(30),
      paddingHorizontal: wp(18),
    },
    contentWrapper: {
      flex: 1,
      position: 'relative',
      top: -20,
    },
    textInputTitle: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(5),
      marginBottom: hp(3),
    },
    bannerImageCtr: {
      borderBottomLeftRadius: hp(10),
      borderBottomRightRadius: hp(10),
    },
    bannerImage: {
      paddingTop: insets.top,
      height: hp(280),
      borderWidth: 1,
      paddingHorizontal: hp(16),
    },
    pencilIcon: {
      position: 'absolute',
      right: hp(16),
      bottom: hp(16),
    },
    imageCtr: {
      height: hp(80),
      width: hp(80),
      position: 'relative',
      top: -40,
      left: hp(16),
    },
    image: {
      height: '100%',
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      borderColor: theme.dark ? Colors.Quartz : Colors.ChineseWhite,
    },
    headerCtr: {
      position: 'absolute',
      top: insets.top,
      marginHorizontal: hp(16),
      width: '100%',
    },
    inputContainer: {
      paddingHorizontal: wp(16),
      position: 'relative',
      top: -30,
    },
    radioButtonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    radioButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp(5),
      marginRight: wp(20),
    },
    textRadioButton: {},
    textNote: {
      color: theme.colors.secondaryHeadingColor,
    },
    verificationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    textVerification: {
      marginLeft: wp(10),
    },
    reservedSatsWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(20),
      marginHorizontal: hp(16),
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
  });
export default IssueCollection;
