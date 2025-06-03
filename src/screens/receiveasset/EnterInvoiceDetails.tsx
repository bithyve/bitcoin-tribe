import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import Clipboard from '@react-native-clipboard/clipboard';
import { useQuery } from '@realm/react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import TextField from 'src/components/TextField';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import AppText from 'src/components/AppText';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import Toast from 'src/components/Toast';
import { formatNumber } from 'src/utils/numberWithCommas';
import {
  Asset,
  Coin,
  Collectible,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import SelectYourAsset from './SelectYourAsset';
import RGBAssetList from './RGBAssetList';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';

const getStyles = (theme: AppTheme, inputHeight, appType) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    bodyWrapper: {
      height: appType !== AppType.ON_CHAIN ? '54%' : '66%',
    },
    footerWrapper: {
      height: '25%',
      justifyContent: 'flex-end',
      paddingBottom: hp(20),
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
      // marginTop: hp(5),
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
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
      width: '50%',
    },
    typeViewWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: hp(10),
    },
    chooseInvoiceType: {
      color: theme.colors.headingColor,
    },
    rightCTAStyle: {
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
    inputStyle: {
      width: '80%',
    },
    assetsDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? (windowHeight > 670 ? '18%' : '15%') : '10%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
  });

const EnterInvoiceDetails = () => {
  const { translations } = useContext(LocalizationContext);
  const { invoiceAssetId } = useRoute().params;
  const {
    receciveScreen,
    common,
    assets,
    home,
    sendScreen,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetId, setAssetId] = useState(invoiceAssetId || '');
  const [searchAssetInput, setSearchAssetInput] = useState('');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = React.useState(50);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetsDropdown, setAssetsDropdown] = useState(false);
  const [selectedType, setSelectedType] = React.useState(
    app.appType !== AppType.ON_CHAIN && assetId !== ''
      ? 'lightning'
      : 'bitcoin',
  );
  const coins = useQuery<Coin[]>(RealmSchema.Coin).filtered(
    'balance.spendable > 0',
  );
  const collectibles = useQuery<Collectible[]>(
    RealmSchema.Collectible,
  ).filtered('balance.spendable > 0');

  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const { mutateAsync, isLoading, data, reset } = useMutation(
    ({ query }: { query: string }) => ApiHandler.searchAssetFromRegistry(query),
  );

  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );

  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
  );

  const styles = getStyles(theme, inputHeight, app.appType);
  const handlePasteAddress = async () => {
    const clipboardValue = await Clipboard.getString();
    setAssetId(clipboardValue);
  };

  useEffect(() => {
    const searchAsset = async () => {
      const trimmed = searchAssetInput.trim();
      if (trimmed.length === 0) {
        reset();
        return;
      }
      await mutateAsync({ query: trimmed });
    };

    searchAsset();
  }, [searchAssetInput]);

  function validateAndNavigateToReceiveAsset() {
    const assetIdPattern = /^rgb:([a-zA-Z0-9!$-]+(-[a-zA-Z0-9!$-]+)*)$/;
    if (assetIdPattern.test(assetId)) {
      navigation.navigate(NavigationRoutes.RECEIVEASSET, {
        refresh: true,
        assetId,
        amount,
        selectedType,
      });
    } else {
      Toast('Invalid asset ID', true);
    }
  }

  const handleAmountInputChange = text => {
    const cleanText = text.replace(/,/g, '');
    const reg = /^\d*$/;
    if (reg.test(cleanText)) {
      setAmount(text);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={home.addAssets} subTitle={''} enableBack={true} />
      {app.appType !== AppType.ON_CHAIN && (
        <View>
          <View>
            <AppText variant="heading3" style={styles.chooseInvoiceType}>
              {receciveScreen.chooseInvoiceType}
            </AppText>
          </View>
          <View style={styles.wrapper}>
            <View style={styles.radioBtnWrapper}>
              <RadioButton.Android
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
                value={'bitcoin'}
                status={selectedType === 'bitcoin' ? 'checked' : 'unchecked'}
                onPress={() => setSelectedType('bitcoin')}
              />
              <View style={styles.typeViewWrapper}>
                <AppText variant="body2" style={styles.feePriorityText}>
                  {receciveScreen.onchain}
                </AppText>
              </View>
            </View>
            <View style={styles.radioBtnWrapper}>
              <RadioButton.Android
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
                value={'lightning'}
                status={selectedType === 'lightning' ? 'checked' : 'unchecked'}
                onPress={() => setSelectedType('lightning')}
              />
              <View style={styles.typeViewWrapper}>
                <AppText variant="body2" style={styles.feePriorityText}>
                  {receciveScreen.lightning}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      )}
      <View style={styles.bodyWrapper}>
        <SelectYourAsset
          selectedAsset={selectedAsset}
          onPress={() => {
            if (assetsData.length) {
              setAssetsDropdown(true);
            }
          }}
        />
        <TextField
          value={formatNumber(amount)}
          onChangeText={handleAmountInputChange}
          placeholder={assets.amount}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.footerWrapper}>
        {colorable.length === 0 ? (
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
        ) : null}
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => validateAndNavigateToReceiveAsset()}
          secondaryTitle={selectedType === 'bitcoin' && common.skip}
          secondaryOnPress={() =>
            navigation.navigate(NavigationRoutes.RECEIVEASSET, {
              refresh: true,
              assetId: '',
              amount: '',
              selectedType,
            })
          }
          disabled={assetId === '' || amount === ''}
          width={
            selectedType === 'bitcoin' ? windowWidth / 2.3 : windowWidth / 1.1
          }
          secondaryCTAWidth={windowWidth / 2.3}
        />
      </View>
      {assetsDropdown && (
        <RGBAssetList
          style={styles.assetsDropdownContainer}
          assets={data?.records ? data?.records : assetsData}
          callback={item => {
            setSelectedAsset(item || item?.asset);
            setAssetsDropdown(false);
            setAssetId(item?.assetId || item?.asset?.assetId);
          }}
          searchAssetInput={searchAssetInput}
          onChangeSearchInput={(text: string) => {
            setSearchAssetInput(text);
          }}
          selectedAsset={selectedAsset || selectedAsset?.asset}
          onDissmiss={() => setAssetsDropdown(false)}
          isLoading={isLoading}
        />
      )}
    </ScreenContainer>
  );
};

export default EnterInvoiceDetails;
