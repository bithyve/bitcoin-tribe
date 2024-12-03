import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import AppHeader from 'src/components/AppHeader';
import { Image, Keyboard, Platform, StyleSheet, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { AssetType } from 'src/models/interfaces/RGBWallet';
import pickImage from 'src/utils/imagePicker';
import IconClose from 'src/assets/images/image_icon_close.svg';
import IconCloseLight from 'src/assets/images/image_icon_close_light.svg';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import SegmentedButtons from 'src/components/SegmentedButtons';
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

function IssueScreen() {
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
  const [loading, setLoading] = useState(false);

  const [visibleFailedToCreatePopup, setVisibleFailedToCreatePopup] =
    useState(false);
  const [assetType, setAssetType] = useState<AssetType>(AssetType.Coin);
  const [image, setImage] = useState('');

  const createUtxos = useMutation(ApiHandler.createUtxos);
  const viewUtxos = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWalletMutation = useMutation(ApiHandler.refreshRgbWallet);
  const storedWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet);
  const UnspentUTXOData = storedWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );

  const totalReserveSatsAmount = useMemo(() => {
    return ApiHandler.calculateTotalReserveSatsAmount(UnspentUTXOData);
  }, [UnspentUTXOData]);

  useEffect(() => {
    if (createUtxos.data) {
      setLoading(true);
      setTimeout(onPressIssue, 500);
    } else if (createUtxos.data === false) {
      setLoading(false);
      setTimeout(() => {
        setVisibleFailedToCreatePopup(true);
      }, 500);

      Toast(walletTranslation.failedToCreateUTXO, true);
    }
  }, [createUtxos.data]);

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
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        refreshRgbWalletMutation.mutate();
        navigation.dispatch(popAction);
      } else if (
        response?.error === 'Insufficient sats for RGB' ||
        response?.name === 'NoAvailableUtxos'
      ) {
        setLoading(false);
        setTimeout(() => {
          createUtxos.mutate();
        }, 500);
      } else if (response?.error) {
        setLoading(false);
        Toast(`Failed: ${response?.error}`, true);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [assetName, assetTicker, navigation, totalSupplyAmt]);

  const issueCollectible = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await ApiHandler.issueNewCollectible({
        name: assetName.trim(),
        description: description,
        supply: totalSupplyAmt.replace(/,/g, ''),
        filePath: Platform.select({
          android: appType === AppType.NODE_CONNECT ? image.startsWith('file://') ? image : `file://${path}` : image.replace('file://', ''),
          ios: image.replace('file://', ''),
        }),
      });
      if (response?.assetId) {
        setLoading(false);
        Toast(assets.assetCreateMsg);
        viewUtxos.mutate();
        navigation.dispatch(popAction);
      } else if (
        response?.error === 'Insufficient sats for RGB' ||
        response?.name === 'NoAvailableUtxos'
      ) {
        setLoading(false);
        setTimeout(() => {
          createUtxos.mutate();
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
  ]);

  const isButtonDisabled = useMemo(() => {
    if (assetType === AssetType.Coin) {
      return !assetName || !assetTicker || !totalSupplyAmt;
    }
    return !assetName || !description || !totalSupplyAmt || !image;
  }, [assetName, assetTicker, totalSupplyAmt, image, description, assetType]);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const onPressIssue = () => {
    if (assetType === AssetType.Coin) {
      issueCoin();
    } else {
      issueCollectible();
    }
  };

  const handleTabChange = () => {
    setDescription('');
    setAssetTicker('');
    setAssetName('');
    setTotalSupplyAmt('');
    setImage('');
  };

  return (
    <ScreenContainer>
      <AppHeader title={home.issueNew} />
      <View>
        <ResponsePopupContainer
          visible={loading || createUtxos.isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={assets.issueAssetLoadingTitle}
            subTitle={assets.issueAssetLoadingSubTitle}
            illustrationPath={require('src/assets/images/issuingAsset.json')}
          />
        </ResponsePopupContainer>
      </View>
      <SegmentedButtons
        value={assetType}
        onValueChange={value => {
          if (value !== assetType) {
            // Switching to a different tab, reset all states
            handleTabChange();
            setAssetType(value);
          } else {
          }
        }}
        buttons={[
          {
            value: AssetType.Coin,
            label: assets.coins,
          },
          {
            value: AssetType.Collectible,
            label: assets.collectibles,
          },
        ]}
        // style={styles.segmentedButtonsStyle}
      />
      <KeyboardAvoidView style={styles.contentWrapper}>
        {assetType === AssetType.Coin ? (
          <View>
            <TextField
              value={assetName}
              onChangeText={text => setAssetName(text)}
              placeholder={home.assetName}
              maxLength={32}
              style={styles.input}
              autoCapitalize="words"
            />

            <TextField
              value={assetTicker}
              onChangeText={text => setAssetTicker(text.trim().toUpperCase())}
              placeholder={home.assetTicker}
              maxLength={8}
              style={styles.input}
              autoCapitalize="characters"
            />

            <TextField
              value={formatNumber(totalSupplyAmt)}
              onChangeText={text => setTotalSupplyAmt(text)}
              placeholder={home.totalSupplyAmount}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ) : (
          <View>
            <TextField
              value={assetName}
              onChangeText={text => setAssetName(text)}
              placeholder={home.assetName}
              maxLength={32}
              style={styles.input}
              autoCapitalize="words"
            />
            <TextField
              value={description}
              onChangeText={text => setDescription(text)}
              placeholder={home.assetDescription}
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              keyboardType={'default'}
              returnKeyType={'Enter'}
              maxLength={100}
              multiline={true}
              numberOfLines={2}
              style={[styles.input, description && styles.descInput]}
            />
            <TextField
              value={formatNumber(totalSupplyAmt)}
              onChangeText={text => setTotalSupplyAmt(text)}
              placeholder={home.totalSupplyAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <UploadAssetFileButton
              onPress={handlePickImage}
              title={home.uploadFile}
              icon={!isThemeDark ? <UploadFile /> : <UploadFileLight />}
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
                  {!isThemeDark ? <IconClose /> : <IconCloseLight />}
                </AppTouchable>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidView>
      {totalReserveSatsAmount === 0 && (
        <View style={styles.reservedSatsWrapper}>
          <View style={styles.checkIconWrapper}>
            <CheckIcon />
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
  });
export default IssueScreen;
