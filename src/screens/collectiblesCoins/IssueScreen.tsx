import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { Image, Keyboard, Platform, StyleSheet, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import { AssetType } from 'src/models/interfaces/RGBWallet';
import pickImage from 'src/utils/imagePicker';
import IconClose from 'src/assets/images/image_icon_close.svg';
import SegmentedButtons from 'src/components/SegmentedButtons';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import UploadAssetFileButton from './components/UploadAssetFileButton';
import UploadFile from 'src/assets/images/uploadFile.svg';
import { formatNumber } from 'src/utils/numberWithCommas';
import AppTouchable from 'src/components/AppTouchable';

function IssueScreen() {
  const popAction = StackActions.pop(2);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { home, common, assets } = translations;
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [description, setDescription] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const createUtxos = useMutation(ApiHandler.createUtxos);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>(AssetType.Coin);
  const [image, setImage] = useState('');

  const issueCoin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    const response = await ApiHandler.issueNewCoin({
      name: assetName.trim(),
      ticker: assetTicker,
      supply: totalSupplyAmt.replace(/,/g, ''),
    });
    setLoading(false);
    if (response?.assetId) {
      Toast(assets.assetCreateMsg, true);
      navigation.dispatch(popAction);
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`, false, true);
    }
  }, [assetName, assetTicker, navigation, totalSupplyAmt]);

  const issueCollectible = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    const response = await ApiHandler.issueNewCollectible({
      name: assetName.trim(),
      description: description,
      supply: totalSupplyAmt.replace(/,/g, ''),
      filePath: image?.path?.replace('file://', ''),
    });
    console.log(response);
    setLoading(false);
    if (response?.assetId) {
      Toast(assets.assetCreateMsg, true);
      navigation.dispatch(popAction);
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`, false, true);
    }
  }, [
    assetName,
    assets.assetCreateMsg,
    description,
    image?.path,
    navigation,
    totalSupplyAmt,
  ]);

  useEffect(() => {
    if (createUtxos.error) {
      Toast(assets.insufficientSatsMainWallet, false, true);
    } else if (createUtxos.isSuccess) {
      setShowErrorModal(false);
      onPressIssue();
    }
  }, [createUtxos.error, createUtxos.isSuccess, createUtxos.data, issueCoin]);

  const isButtonDisabled = useMemo(() => {
    if (assetType === AssetType.Coin) {
      return !assetName || !assetTicker || !totalSupplyAmt;
    }
    return !assetName || !description || !totalSupplyAmt || !image;
  }, [assetName, assetTicker, totalSupplyAmt, image, description, assetType]);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(1000, 1000, false);
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

  return (
    <ScreenContainer>
      <AppHeader title={home.issueNew} />
      <ModalLoading visible={loading || createUtxos.isLoading} />
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          createUtxos.mutate();
        }}
      />
      <SegmentedButtons
        value={assetType}
        onValueChange={value => setAssetType(value)}
        buttons={[
          {
            value: AssetType.Coin,
            label: 'Coins',
          },
          {
            value: AssetType.Collectible,
            label: 'Collectibles',
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
            {/* <View style={styles.uploadCoinAssetWrapper}>
              <AppText variant="body1" style={styles.selectAvatarStyle}>
                {home.yourCoinAvatar}
              </AppText>
              <View style={styles.uploadBtnWrapper}>
                <UploadAssetFileButton
                  onPress={() => {}}
                  title={home.select}
                  icon={<IconImagePlaceholder />}
                  borderColor={theme.colors.accent1}
                  // imagePath={image && image.path.replace('file://', '')}
                />
              </View>
            </View> */}
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
              maxLength={32}
              style={styles.input}
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
              icon={<UploadFile />}
            />
            {image && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      Platform.OS === 'ios'
                        ? image.path.replace('file://', '')
                        : image.path,
                  }}
                  style={styles.imageStyle}
                />
                <AppTouchable
                  style={styles.closeIconWrapper}
                  onPress={() => setImage('')}>
                  <IconClose />
                </AppTouchable>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidView>
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={onPressIssue}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
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
    uploadCoinAssetWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    selectAvatarStyle: {
      color: theme.colors.headingColor,
      width: '60%',
      paddingLeft: hp(20),
    },
    uploadBtnWrapper: {
      width: '40%',
      // paddingRight: hp(5),
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
  });
export default IssueScreen;
