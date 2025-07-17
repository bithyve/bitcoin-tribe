import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import Toast from 'react-native-root-toast';
import Clipboard from '@react-native-clipboard/clipboard';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CustomToast from 'src/components/Toast';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { formatNumber } from 'src/utils/numberWithCommas';
import SelectAssetIDView from './components/SelectAssetIDView';
import RGBAssetDropdownList from './components/RGBAssetDropdownList';
import { Keys } from 'src/storage';
import {
  Asset,
  Coin,
  Collectible,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useRgbWallets from 'src/hooks/useRgbWallets';
import AppType from 'src/models/enums/AppType';

const OpenRgbChannel = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const {
    common,
    node,
    assets,
    channel: channelTranslation,
    sendScreen,
  } = translations;
  const [pubkeyAddress, setPubkeyAddress] = useState('');
  const [capacity, setCapacity] = useState('30010');
  const [pushMsats, setPushMsats] = useState('1394');
  const [assetId, setAssetId] = useState('');
  const [assetAmt, setAssetAmt] = useState('');
  const [baseFeeRate, setBaseFeeRate] = useState('1000');
  const [tmpChannelId, setTmpChannelId] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [inputAssetIDHeight, setInputAssetIDHeight] = useState(100);
  const [assetsDropdown, setAssetsDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [pubKeyAddressValidationError, setPubKeyAddressValidationError] =
    useState('');
  const [capacityValidationError, setCapacityValidationError] = useState('');
  const [pushMSatsValidationError, setPushMSatsValidationError] = useState('');
  const [assetAmountValidationError, setAssetAmountValidationError] =
    useState('');

  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const openChannelMutation = useMutation(ApiHandler.openChannel);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, inputHeight, inputAssetIDHeight);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(
    RealmSchema.Collectible,
  );
  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combined
      .filter(asset => 
        asset && 
        asset.balance && 
        Number(asset.balance.spendable) > 0
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  useEffect(() => {
    const { isSuccess, isError, error } = openChannelMutation;
    if (isSuccess) {
      navigation.goBack();
      CustomToast(node.channelCreatedMsg);
    } else if (isError) {
      CustomToast(`${error}`, true);
    }
  }, [openChannelMutation.isSuccess, openChannelMutation.isError]);

  useEffect(() => {
    const amount = parseFloat(assetAmt.replace(/,/g, ''));
    if (Number(selectedAsset?.balance?.spendable) === 0) {
      setAssetAmountValidationError(
        sendScreen.spendableBalanceMsg + selectedAsset?.balance.spendable,
      );
    }
    if (selectedAsset?.balance?.spendable < amount) {
      setAssetAmountValidationError(
        assets.checkSpendableAmt + selectedAsset?.balance?.spendable,
      );
    }
    if (assetAmt && !selectedAsset) {
      Keyboard.dismiss();
      CustomToast(
        channelTranslation.selectYourAssetErrMsg,
        true,
        Toast.positions.TOP,
      );
    }
  }, [assetAmt, selectedAsset]);

  const isButtonDisabled = useMemo(() => {
    return !pubkeyAddress || !capacity || !pushMsats || !assetId || !assetAmt;
  }, [pubkeyAddress, capacity, pushMsats, assetId, assetAmt]);

  const sanitizeInput = text => text.replace(/[^0-9]/g, '');

  const balances = useMemo(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    } else {
    }
  }, [rgbWallet?.nodeBtcBalance?.vanilla?.spendable]);

  const handlePubKeyAddressChange = text => {
    if (!text.trim()) {
      setPubkeyAddress('');
      setPubKeyAddressValidationError(channelTranslation.enterPubKeyaddress);
    } else {
      const trimmedText = text.trim();
      setPubkeyAddress(trimmedText);
      setPubKeyAddressValidationError(null);
    }
  };
  const handleCapacityChange = text => {
    const sanitizedText = sanitizeInput(text);
    if (sanitizedText) {
      setCapacity(sanitizedText);
      setCapacityValidationError(null);
    } else if (!sanitizedText) {
      setCapacity('');
      setCapacityValidationError(channelTranslation.enterCapacityAmt);
    }
  };
  const handlePushMSatsChange = text => {
    const sanitizedText = sanitizeInput(text);
    if (sanitizedText) {
      setPushMsats(sanitizedText);
      setPushMSatsValidationError(null);
    } else if (!sanitizedText) {
      setPushMsats('');
      setPushMSatsValidationError(channelTranslation.enterMSats);
    }
  };

  const handleAssetAmountChange = text => {
    const sanitizedText = sanitizeInput(text);
    if (sanitizedText) {
      setAssetAmt(sanitizedText);
      setAssetAmountValidationError(null);
    } else if (!sanitizedText) {
      setAssetAmt('');
      setAssetAmountValidationError(channelTranslation.enterAssetAmt);
    }
  };

  const handlePasteURL = async () => {
    const clipboardValue = await Clipboard.getString();
    await setPubkeyAddress(clipboardValue);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={assetsDropdown ? '' : node.openChannelTitle}
        onBackNavigation={() => {
          if (assetsDropdown) {
            setAssetsDropdown(false);
          } else {
            navigation.goBack();
          }
        }}
      />
      <View>
        <ResponsePopupContainer
          visible={openChannelMutation.isLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={channelTranslation.createChannelTitle}
            subTitle={channelTranslation.createChannelSubTitle}
            illustrationPath={require('src/assets/images/jsons/channelCreation.json')}
            style={styles.inProgressViewStyle}
          />
        </ResponsePopupContainer>
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        enableOnAndroid={true}
        // extraScrollHeight={windowHeight > 670 ? 200 : 150}
        keyboardOpeningTime={0}>
        <AppText variant="body2" style={styles.labelText}>
          {node.peerUrlLabel}
        </AppText>
        <TextField
          value={pubkeyAddress}
          onChangeText={handlePubKeyAddressChange}
          placeholder={node.peerPubAndAddress}
          style={[styles.input, pubkeyAddress && styles.multilinePubKeyInput]}
          contentStyle={
            pubkeyAddress ? styles.inputURLWrapper : styles.inputWrapper1
          }
          inputStyle={styles.inputStyle1}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          keyboardType={'default'}
          returnKeyType={'Enter'}
          rightText={!pubkeyAddress && sendScreen.paste}
          rightIcon={
            pubkeyAddress && isThemeDark ? <ClearIcon /> : <ClearIconLight />
          }
          onRightTextPress={() =>
            pubkeyAddress ? setPubkeyAddress('') : handlePasteURL()
          }
          rightCTAStyle={styles.rightCTAStyle1}
          rightCTATextColor={theme.colors.accent1}
          multiline={true}
          numberOfLines={5}
          error={pubKeyAddressValidationError}
        />

        <AppText variant="caption" style={styles.textHint}>
          {node.peerPubAndAddressNote}
        </AppText>

        <AppText variant="body2" style={styles.labelText}>
          {node.channelCapacityLabel}
        </AppText>
        <TextField
          value={capacity}
          onChangeText={handleCapacityChange}
          placeholder={node.capacity}
          // style={styles.input}
          keyboardType="numeric"
          error={capacityValidationError}
          rightText={
            capacity ? channelTranslation.availableBalanceText + balances : ''
          }
          style={styles.assetAmtInput}
          inputStyle={styles.inputStyle}
          contentStyle={styles.contentStyle}
          onRightTextPress={() => {}}
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.headingColor}
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.capacityNote}
        </AppText>
        <AppText variant="body2" style={styles.labelText}>
          {node.initPeerBalncLabel}
        </AppText>
        <TextField
          value={pushMsats}
          onChangeText={handlePushMSatsChange}
          placeholder={node.pushMsats}
          style={styles.input}
          keyboardType="numeric"
          error={pushMSatsValidationError}
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.pushMsatsNote}
        </AppText>
        <SelectAssetIDView
          selectedAsset={selectedAsset}
          onPress={() => {
            if (assetsData.length) {
              setAssetsDropdown(true);
            } else {
              CustomToast(assets.noAssetsFoundMsg, true);
            }
          }}
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.assetIDNote}
        </AppText>
        <AppText variant="body2" style={styles.labelText}>
          {node.assetAmountLabel}
        </AppText>
        <TextField
          value={formatNumber(assetAmt)}
          onChangeText={handleAssetAmountChange}
          placeholder={node.assetAmount}
          multiline={false}
          numberOfLines={1}
          keyboardType="numeric"
          rightText={
            selectedAsset
              ? channelTranslation.availableBalanceText +
                selectedAsset?.balance?.spendable
              : ''
          }
          style={styles.assetAmtInput}
          inputStyle={styles.inputStyle}
          contentStyle={styles.contentStyle}
          onRightTextPress={() => {}}
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.headingColor}
          error={assetAmountValidationError}
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.assetAmountNote}
        </AppText>
        {/* <TextField
        value={baseFeeRate}
        onChangeText={text => setBaseFeeRate(text)}
        placeholder={'Base Fee Rate'}
        style={styles.input}
        keyboardType="numeric"
      /> */}

        {/* <TextField
        value={tmpChannelId}
        onChangeText={text => setTmpChannelId(text)}
        placeholder={'Temporary Channel ID'}
        style={styles.input}
      /> */}

        <View style={styles.buttonWrapper}>
          <Buttons
            primaryTitle={common.proceed}
            primaryOnPress={() => {
              openChannelMutation.mutate({
                peerPubkeyAndOptAddr: pubkeyAddress,
                capacitySat: Number(capacity),
                pushMsat: Number(pushMsats) * 1000,
                assetId: assetId,
                assetAmount: Number(assetAmt),
                feeBaseMsat: Number(baseFeeRate),
                isPublic: true,
                feeProportionalMillionths: 0,
                temporaryChannelId: tmpChannelId,
                withAnchors: true,
              });
            }}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => navigation.goBack()}
            disabled={isButtonDisabled}
            width={windowWidth / 2.3}
            secondaryCTAWidth={windowWidth / 2.3}
            primaryLoading={false}
          />
        </View>
      </KeyboardAwareScrollView>
      {assetsDropdown && (
        <RGBAssetDropdownList
          style={styles.assetsDropdownContainer}
          assets={assetsData}
          callback={item => {
            setSelectedAsset(item);
            setAssetsDropdown(false);
            setAssetId(item?.assetId);
          }}
          selectedAsset={selectedAsset}
          onDissmiss={() => setAssetsDropdown(false)}
        />
      )}
    </ScreenContainer>
  );
};

export default OpenRgbChannel;

const getStyles = (theme: AppTheme, inputHeight, inputAssetIDHeight) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    inputWrapper1: {
      height: hp(60),
      marginVertical: hp(5),
    },
    inputStyle: {
      width: '60%',
      marginVertical: hp(5),
    },
    inputStyle1: {
      width: '80%',
    },
    assetAmtInput: {
      height: hp(60),
      marginVertical: hp(5),
    },
    contentStyle: {
      marginTop: 0,
      flexWrap: 'wrap',
    },
    multilinePubKeyInput: {
      borderRadius: hp(15),
      // height: Math.max(60, inputHeight),
    },
    multilineAssetIDInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputAssetIDHeight),
    },
    buttonWrapper: {
      marginTop: hp(20),
      marginRight: hp(5),
    },
    textHint: {
      marginTop: hp(5),
      marginBottom: hp(20),
      color: theme.colors.secondaryHeadingColor,
    },
    assetsDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? (windowHeight > 670 ? '18%' : '15%') : '10%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
    rightCTAStyle: {
      width: '40%',
      alignItems: 'flex-end',
      paddingRight: hp(10),
    },
    inProgressViewStyle: {
      alignItems: 'flex-start',
    },
    labelText: {
      color: theme.colors.headingColor,
      marginBottom: hp(3),
    },
    rightCTAStyle1: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputURLWrapper: {
      borderRadius: 10,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(50, inputHeight),
      marginTop: 0,
    },
  });
