import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, useTheme, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVNumber } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import TextField from 'src/components/TextField';
import { hp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import UncheckIcon from 'src/assets/images/uncheckIcon.svg';
import UncheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import AppText from 'src/components/AppText';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import {
  Asset,
  Coin,
  Collectible,
  InvoiceMode,
  RgbUnspent,
  RGBWallet,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
import SelectYourAsset from './SelectYourAsset';
import RGBAssetList from './RGBAssetList';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import InvoiceExpirySlider from './components/InvoiceExpirySlider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppContext } from 'src/contexts/AppContext';
import Fonts from 'src/constants/Fonts';
import InsufficiantBalancePopupContainer from '../collectiblesCoins/components/InsufficiantBalancePopupContainer';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { events, logCustomEvent } from 'src/services/analytics';

const getStyles = (theme: AppTheme, inputHeight, appType) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    bodyWrapper: {
      height: appType !== AppType.ON_CHAIN ? '43%' : '57%',
      marginTop: hp(10),
    },
    footerWrapper: {
      height: '25%',
      paddingBottom: hp(20),
      marginTop: 40,
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
      marginTop: hp(20),
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
      borderRadius: 20,
    },
    segmentedButtons: {
      marginVertical: hp(5),
      borderWidth: 0.4,
      borderColor: theme.colors.secondaryHeadingColor,
      borderRadius: 10,
    },
    segmentedButtonsTitle: {
      marginVertical: hp(10),
      fontSize: 15,
      color: theme.colors.secondaryHeadingColor,
      fontFamily: Fonts.LufgaRegular,
    },
    watchtowerCtr: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginTop: hp(20),
      marginBottom: hp(10),
    },
  });

const EnterInvoiceDetails = () => {
  const { translations } = useContext(LocalizationContext);
  const { appType, isWalletOnline } = useContext(AppContext);
  const { invoiceAssetId, chosenAsset } = useRoute().params;
  const { receciveScreen, common, assets, home } = translations;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetId, setAssetId] = useState(invoiceAssetId || '');
  const [searchAssetInput, setSearchAssetInput] = useState('');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [invoiceExpiry, setInvoiceExpiry] = useMMKVNumber(Keys.INVOICE_EXPIRY);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    chosenAsset || null,
  );
  const [assetsDropdown, setAssetsDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState(
    app.appType !== AppType.ON_CHAIN && assetId !== ''
      ? 'lightning'
      : 'bitcoin',
  );
  const coins = useQuery<Coin[]>(RealmSchema.Coin).filtered(
    "visibility != 'HIDDEN'",
  );
  const collectibles = useQuery<Collectible[]>(
    RealmSchema.Collectible,
  ).filtered("visibility != 'HIDDEN'");
  const [invoiceType, setInvoiceType] = useState(InvoiceMode.Blinded);
  const [visible, setVisible] = useState(false);
  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const { mutateAsync, isLoading, data, reset } = useMutation(
    ({ query }: { query: string }) => ApiHandler.searchAssetFromRegistry(query),
  );
  const wallet: Wallet = useWallets({}).wallets[0];
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );

  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo =>
      utxo.utxo.colorable === true &&
      utxo.rgbAllocations?.length === 0 &&
      utxo.pendingBlinded === 0,
  );
  const [useWatchTower, setUseWatchTower] = useState(false);

  const styles = getStyles(theme, inputHeight, app.appType);

  useEffect(() => {
    if (invoiceExpiry === undefined) {
      setInvoiceExpiry(86400);
    }
  }, [invoiceExpiry]);

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

  const canProceed = useMemo(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      return (
        rgbWallet?.nodeBtcBalance?.vanilla?.spendable +
          rgbWallet?.nodeBtcBalance?.vanilla?.future >
        0
      );
    }
    return (
      wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
  ]);

  function validateAndNavigateToReceiveAsset() {
    if (!canProceed && invoiceType === InvoiceMode.Blinded) {
      setVisible(true);
      return;
    }
    logCustomEvent(events.CREATED_INVOICE);
    navigation.replace(NavigationRoutes.RECEIVEASSET, {
      refresh: true,
      assetId: assetId ?? '',
      amount:
        amount !== ''
          ? selectedAsset?.precision === 0
            ? amount
            : Number(amount) * 10 ** selectedAsset?.precision
          : '',
      selectedType,
      invoiceExpiry,
      invoiceType,
      useWatchTower
    });
  }

  const handleAmountInputChange = text => {
    let regex;
    if (selectedAsset?.precision === 0) {
      regex = /^[1-9]\d*$/;
    } else {
      regex = new RegExp(
        `^(0|[1-9]\\d*)(\\.\\d{0,${selectedAsset?.precision}})?$`,
      );
    }
    if (text === '' || regex.test(text)) {
      setAmount(text);
    }
  };

  const checkIcon = useMemo(() => {
    if (isThemeDark) {
      return useWatchTower ? <CheckIcon /> : <UncheckIcon />;
    }
    return useWatchTower ? <CheckIconLight /> : <UncheckIconLight />;
  }, [useWatchTower]);

  return (
    <ScreenContainer>
      <AppHeader
        title={home.addAssets}
        subTitle={`Select an asset, enter an amount, and set an expiry time—then tap '${assets.generateInvoice}' to create a RGB invoice.`}
        enableBack={true}
      />
      <KeyboardAwareScrollView
        overScrollMode="never"
        bounces={false}
        keyboardOpeningTime={0}
      >
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
                  status={
                    selectedType === 'lightning' ? 'checked' : 'unchecked'
                  }
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
              setAssetsDropdown(true);
            }}
          />
          <TextField
            value={amount}
            onChangeText={handleAmountInputChange}
            placeholder={assets.amount}
            style={styles.input}
            keyboardType="numeric"
          />
          <InvoiceExpirySlider
            value={invoiceExpiry}
            onValueChange={setInvoiceExpiry}
          />

          <AppText variant="caption" style={styles.segmentedButtonsTitle}>
            Invoice Type
          </AppText>
          <SegmentedButtons
            value={invoiceType}
            onValueChange={(value: InvoiceMode) => setInvoiceType(value)}
            theme={{ colors: { primary: theme.colors.accent1 } }}
            style={styles.segmentedButtons}
            buttons={[
              {
                value: InvoiceMode.Blinded,
                label: 'Blinded',
                style: { borderRadius: 10 },
              },
              {
                value: InvoiceMode.Witness,
                label: 'Witness',
                style: { borderRadius: 10 },
              },
            ]}
          />
          <Pressable onPress={()=>setUseWatchTower(prev=> !prev)}
            style={styles.watchtowerCtr}
          >
            <View style={styles.checkIconWrapper}>{checkIcon}</View>
            <View style={styles.reservedSatsWrapper1}>
              <AppText variant="body2" >
                {receciveScreen.validateUsingWatchTower}
              </AppText>
            </View>
          </Pressable>
        </View>
        <View style={styles.footerWrapper}>
          {colorable.length === 0 && invoiceType === InvoiceMode.Blinded ? (
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
          ) : (
            <View style={styles.reservedSatsWrapper} />
          )}
          <View style={{ alignSelf: 'center' }}>
            <Buttons
              primaryTitle={assets.generateInvoice}
              primaryOnPress={() => validateAndNavigateToReceiveAsset()}
              width={'100%'}
              disabled={
                isWalletOnline === WalletOnlineStatus.Error ||
                isWalletOnline === WalletOnlineStatus.InProgress
              }
            />
          </View>
        </View>
        {assetsDropdown && (
          <RGBAssetList
            style={styles.assetsDropdownContainer}
            assets={data?.records ? data?.records : assetsData}
            callback={item => {
              Keyboard.dismiss();
              setSelectedAsset(item || item?.asset);
              setAssetsDropdown(false);
              setAssetId(item?.assetId || item?.asset?.assetId);
              setAmount('');
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

        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          onDismiss={() => setVisible(false)}
          backColor={theme.colors.cardGradient1}
          borderColor={theme.colors.borderColor}
        >
          <InsufficiantBalancePopupContainer
            primaryOnPress={() => {
              setVisible(false);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.RECEIVESCREEN);
              }, 500);
            }}
            secondaryOnPress={() => setVisible(false)}
          />
        </ResponsePopupContainer>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default EnterInvoiceDetails;
