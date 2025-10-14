import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
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

import pickImage from 'src/utils/imagePicker';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { formatNumber } from 'src/utils/numberWithCommas';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import FailedToCreatePopupContainer from './components/FailedToCreatePopupContainer';

import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PencilRound from 'src/assets/images/pencil_round.svg';
import ModalContainer from 'src/components/ModalContainer';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { CreateCollectionConfirmation } from 'src/components/CollectionConfirmationModal';
const MOCK_BANNER = require('src/assets/images/mockBanner.png');
const MOCK_COLLECTION = require('src/assets/images/mockCollection.png');
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

  const { mutate: createUtxos } = useMutation(ApiHandler.createUtxos);
  const viewUtxos = useMutation(ApiHandler.viewUtxos);
  const totalSupplyInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    viewUtxos.mutate();
  }, []);

  const isButtonDisabled = useMemo(() => {
    return !collectionName || !description || !image;
  }, [collectionName, description, image, totalSupplyAmt]);

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

  return (
    <View style={styles.parentContainer}>
      <KeyboardAvoidView style={styles.contentWrapper}>
        <ImageBackground
          source={
            !image?.trim()
              ? MOCK_BANNER
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
            <PencilRound />
          </AppTouchable>
        </ImageBackground>
        <View>
          <Pressable onPress={handlePickCollectionImage}>
            <Image
              source={
                !collectionImage?.trim()
                  ? MOCK_COLLECTION
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
        </View>

        <View style={{paddingHorizontal:wp(16)}}>
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
        </View>

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

      <View
        style={styles.headerCtr}>
        <AppHeader title={assets.issueCollection} />
      </View>

      <ModalContainer
        title={showSuccess? assets.collectionPaymentConfirm:assets.collectionPayment}
        subTitle={showSuccess? assets.collectionPaymentConfirmSubtitle : assets.collectionPaymentSubtitle}
        visible={showPayment}
        enableCloseIcon={false}
        onDismiss={() => {}}>
        <CreateCollectionConfirmation
          showSuccess={showSuccess}
          setShowSuccess={setShowSuccess}
          baseFee={'10k'}
          total={'200'}
          rate={'2,000,000'}
          closeModal={mode => {
            setShowPayment(false);
            setShowSuccess(false);
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
      paddingHorizontal:wp(18)
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
    image: {
      height: hp(80),
      width: hp(80),
      borderWidth: 1,
      borderRadius: 10,
      position: 'relative',
      top: -40,
      left: hp(16),
      borderColor: 'rgba(86, 86, 86, 1)', // border color
    },
    headerCtr:{
          position: 'absolute',
          top: insets.top,
          marginHorizontal: hp(16),
        }
  });
export default IssueCollection;
