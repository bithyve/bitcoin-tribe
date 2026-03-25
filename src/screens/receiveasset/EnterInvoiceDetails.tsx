import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, useTheme, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVBoolean, useMMKVNumber } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import TextField from 'src/components/TextField';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
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
import Toast from 'src/components/Toast';
import InvoiceExpirySlider from './components/InvoiceExpirySlider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from 'src/contexts/AppContext';
import Fonts from 'src/constants/Fonts';
import InsufficiantBalancePopupContainer from '../collectiblesCoins/components/InsufficiantBalancePopupContainer';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import useWallets from 'src/hooks/useWallets';
import useRgbWallets from 'src/hooks/useRgbWallets';
import {
  useReceiveInvoiceFlow,
  ReceiveInvoiceSelectedType,
} from 'src/hooks/useReceiveInvoiceFlow';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { events, logCustomEvent } from 'src/services/analytics';
import config, { APP_STAGE } from 'src/utils/config';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import { SizedBox } from 'src/components/SizedBox';
import FooterNote from 'src/components/FooterNote';
import AppTouchable from 'src/components/AppTouchable';
import ArrowUp from 'src/assets/images/arrowUpGrey.svg';
import ArrowDown from 'src/assets/images/arrowDownGrey.svg';

const getStyles = (theme: AppTheme, inputHeight, appType) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    bodyWrapper: {
      height: appType !== AppType.ON_CHAIN ? '43%' : '57%',
      marginTop: hp(10),
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
    assetsModalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    assetsModalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    assetsModalSheet: {
      height: windowHeight * 0.76,
      width: '100%',
      paddingHorizontal: hp(12),
      paddingTop: hp(10),
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.primaryBackground,
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
    feePriorityText: {
      color: theme.colors.headingColor,
    },
    invoiceErrorModalContent: {
      paddingVertical: hp(10),
      paddingHorizontal: hp(8),
    },
    invoiceErrorMessage: {
      marginTop: hp(12),
      marginBottom: hp(24),
      textAlign: 'center',
    },
  });

const EnterInvoiceDetails = () => {
  const { translations } = useContext(LocalizationContext);
  const { isWalletOnline } = useContext(AppContext);
  const route = useRoute();
  const params = (route.params ?? {}) as {
    invoiceAssetId?: string;
    chosenAsset?: Asset | null;
  };
  const { invoiceAssetId, chosenAsset } = params;
  const {
    receciveScreen,
    assets,
    home,
    sendScreen,
    common,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const app = useQuery(RealmSchema.TribeApp)[0] as unknown as TribeApp;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetId, setAssetId] = useState(invoiceAssetId || '');
  const [searchAssetInput, setSearchAssetInput] = useState('');
  const [amount, setAmount] = useState('');
  const [inputHeight] = useState(50);
  const [invoiceExpiry, setInvoiceExpiry] = useMMKVNumber(Keys.INVOICE_EXPIRY);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    chosenAsset || null,
  );
  const [assetsDropdown, setAssetsDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState<ReceiveInvoiceSelectedType>(
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
    const combined = [
      ...coins.toJSON(),
      ...collectibles.toJSON(),
    ] as unknown as Asset[];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const {
    mutateAsync: searchRegistryMutateAsync,
    isLoading: isRegistrySearchLoading,
    data,
    reset,
  } = useMutation(({ query }: { query: string }) =>
    ApiHandler.searchAssetFromRegistry(query),
  );
  const mainWallet: Wallet = useWallets({}).wallets[0];
  const rgbWallet: RGBWallet | undefined = useRgbWallets({}).wallets[0];

  const unspent: RgbUnspent[] = useMemo(() => {
    const raw = (rgbWallet?.utxos ?? []) as unknown as string[];
    return raw.map(utxoStr => JSON.parse(utxoStr));
  }, [rgbWallet?.utxos]);
  const colorable = unspent.filter(
    utxo =>
      utxo.utxo.colorable === true &&
      utxo.rgbAllocations?.length === 0 &&
      utxo.pendingBlinded === 0,
  );
  const [useWatchTower, setUseWatchTower] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);

  const styles = getStyles(theme, inputHeight, app.appType);
  const insets = useSafeAreaInsets();

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
      await searchRegistryMutateAsync({ query: trimmed });
    };

    searchAsset();
  }, [searchAssetInput]);

  const canProceed = useMemo(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      return (
        Number(rgbWallet?.nodeBtcBalance?.vanilla?.spendable ?? 0) +
          Number(rgbWallet?.nodeBtcBalance?.vanilla?.future ?? 0) >
        0
      );
    }
    return (
      mainWallet?.specs.balances.confirmed +
        mainWallet?.specs.balances.unconfirmed >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    mainWallet?.specs.balances.confirmed,
    mainWallet?.specs.balances.unconfirmed,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
  ]);

  const precision = useMemo(() => {
    if (selectedAsset != null) {
      return selectedAsset.precision ?? 0;
    }
    if (!assetId) {
      return 0;
    }
    const match = assetsData.find(a => a.assetId === assetId);
    return match?.precision ?? 0;
  }, [selectedAsset, assetId, assetsData]);

  const normalizeAmountForParse = (raw: string) =>
    raw.replace(/\s/g, '').replace(/,/g, '.');

  const amountBaseUnits = useMemo(() => {
    if (amount === '') {
      return 0;
    }
    const normalized = normalizeAmountForParse(amount);
    const n = Number(normalized);
    if (Number.isNaN(n) || n <= 0) {
      return 0;
    }
    if (precision === 0) {
      return Math.round(n);
    }
    return Math.round(n * 10 ** precision);
  }, [amount, precision]);

  const invoiceExpiryEffective =
    invoiceExpiry === undefined ? 86400 : invoiceExpiry;

  const formatInvoiceString = useCallback(
    (template: string, vars: Record<string, string | number>) => {
      const loc = translations as unknown as {
        formatString: (t: string, v: object) => string;
      };
      return String(loc.formatString(template, vars));
    },
    [translations],
  );

  const invoiceNoteSubtitle = useMemo(
    () =>
      formatInvoiceString(receciveScreen.noteSubTitle, {
        time: invoiceExpiryEffective / 3600,
        type:
          invoiceType === InvoiceMode.Witness ? 'witness' : 'blinded',
      }),
    [
      formatInvoiceString,
      receciveScreen.noteSubTitle,
      invoiceExpiryEffective,
      invoiceType,
    ],
  );

  const {
    runInvoiceGeneration,
    invoiceLoading,
    errorModal,
    dismissErrorModal,
    qrValue,
    showInvoiceQr,
    onInvoiceScreenFocused,
  } = useReceiveInvoiceFlow({
    appType: app.appType,
    assetId,
    amountBaseUnits,
    invoiceExpiry: invoiceExpiryEffective,
    invoiceType,
    useWatchTower,
    selectedType,
    onInvoiceCreated: () => logCustomEvent(events.CREATED_INVOICE),
    formatString: formatInvoiceString,
    insufficientSatsTemplate: assets.insufficientSats,
    assetProcessErrorMsg: assets.assetProcessErrorMsg,
    failedToCreateUTXOMsg: walletTranslation.failedToCreateUTXO,
    invoiceErrorTitle: assets.unexpectedErrorTitle,
  });

  useFocusEffect(
    useCallback(() => {
      onInvoiceScreenFocused();
    }, [onInvoiceScreenFocused]),
  );

  const isAmountEntryValid = useMemo(() => {
    if (amount === '') {
      return true;
    }
    if (precision === 0) {
      if (!/^[1-9]\d*$/.test(amount)) {
        return false;
      }
    } else {
      const fractional = new RegExp(
        `^(0|[1-9]\\d*)([.,]\\d{0,${precision}})?$`,
      );
      if (!fractional.test(amount)) {
        return false;
      }
    }
    const n = Number(normalizeAmountForParse(amount));
    return !Number.isNaN(n) && n > 0;
  }, [amount, precision]);

  function validateAndGenerateInvoice() {
    if (!canProceed && invoiceType === InvoiceMode.Blinded) {
      setVisible(true);
      return;
    }
    if (amount !== '' && !isAmountEntryValid) {
      const n = Number(normalizeAmountForParse(amount));
      Toast(
        !Number.isNaN(n) && n <= 0
          ? sendScreen.validationZeroNotAllowed
          : sendScreen.invoiceFormatErrMsg,
        true,
      );
      return;
    }
    runInvoiceGeneration();
  }

  const handleAmountInputChange = (text: string) => {
    if (text === '') {
      setAmount('');
      return;
    }
    let regex: RegExp;
    if (precision === 0) {
      regex = /^[1-9]\d*$/;
    } else {
      regex = new RegExp(
        `^(0|[1-9]\\d*)([.,]\\d{0,${precision}})?$`,
      );
    }
    if (regex.test(text)) {
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
      <AppHeader title={home.addAssets} enableBack={true} />
      <View>
        <ResponsePopupContainer
          visible={invoiceLoading}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}
        >
          <InProgessPopupContainer
            title={assets.requestInvoiceProcessTitle}
            subTitle={assets.requestInvoiceProcessSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/recieveAssetIllustrationDark.json')
                : require('src/assets/images/jsons/recieveAssetIllustrationLight.json')
            }
          />
        </ResponsePopupContainer>
      </View>
      <ResponsePopupContainer
        visible={errorModal.visible}
        enableClose={true}
        onDismiss={dismissErrorModal}
        backColor={theme.colors.cardGradient1}
        borderColor={theme.colors.borderColor}
      >
        <View style={styles.invoiceErrorModalContent}>
          <AppText variant="heading2" style={{ textAlign: 'center' }}>
            {errorModal.title}
          </AppText>
          <AppText
            variant="body1"
            style={[
              styles.invoiceErrorMessage,
              { color: theme.colors.secondaryHeadingColor },
            ]}
          >
            {errorModal.message}
          </AppText>
          <Buttons
            primaryTitle={common.confirm}
            primaryOnPress={dismissErrorModal}
            width={windowWidth / 1.2}
          />
        </View>
      </ResponsePopupContainer>
      <KeyboardAwareScrollView
        overScrollMode="never"
        bounces={false}
        keyboardOpeningTime={0}
      >
        <AppText
          variant="body1"
          style={{ color: theme.colors.mutedTab, alignSelf: 'center' }}
        >
          Scan this code to receive asset
        </AppText>

        {showInvoiceQr && (
          <View style={{ marginTop: hp(20) }}>
            <ShowQRCode
              value={qrValue || 'address'}
              title={
                selectedType === 'bitcoin'
                  ? receciveScreen.invoiceAddress
                  : receciveScreen.lightningAddress
              }
              qrTitleColor={
                selectedType === 'bitcoin'
                  ? theme.colors.btcCtaBackColor
                  : theme.colors.accent1
              }
            />
            <ReceiveQrClipBoard
              qrCodeValue={qrValue}
              message={assets.invoiceCopiedMsg}
            />
          </View>
        )}
        <SizedBox height={hp(20)} />

        <FooterNote title={common.note} subTitle={invoiceNoteSubtitle} />

        {/* Advance Options */}
        <View style={{ marginVertical: hp(10) }}>
          <AppTouchable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={() => setShowAdvanceOptions(!showAdvanceOptions)}
          >
            <AppText variant="body1" style={{ color: theme.colors.mutedTab }}>
              Advance options(Optional)
            </AppText>
            <View>{showAdvanceOptions ? <ArrowUp /> : <ArrowDown />}</View>
          </AppTouchable>
          {/* Options */}

          {showAdvanceOptions && (
            <>
              {/* Onchain option, disabled for now, to be used later */}
              {app.appType !== AppType.ON_CHAIN && (
                <View>
                  <View>
                    <AppText
                      variant="heading3"
                      style={styles.chooseInvoiceType}
                    >
                      {receciveScreen.chooseInvoiceType}
                    </AppText>
                  </View>
                  <View style={styles.wrapper}>
                    <View style={styles.radioBtnWrapper}>
                      <RadioButton.Android
                        color={theme.colors.accent1}
                        uncheckedColor={theme.colors.headingColor}
                        value={'bitcoin'}
                        status={
                          selectedType === 'bitcoin' ? 'checked' : 'unchecked'
                        }
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
                {config.ENVIRONMENT != APP_STAGE.PRODUCTION && (
                  <Pressable
                    onPress={() => setUseWatchTower(prev => !prev)}
                    style={styles.watchtowerCtr}
                  >
                    <View style={styles.checkIconWrapper}>{checkIcon}</View>
                    <View style={styles.reservedSatsWrapper1}>
                      <AppText variant="body2">
                        {receciveScreen.validateUsingWatchTower}
                      </AppText>
                    </View>
                  </Pressable>
                )}

                {colorable.length === 0 &&
                invoiceType === InvoiceMode.Blinded ? (
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
                    primaryOnPress={() => validateAndGenerateInvoice()}
                    width={'100%'}
                    disabled={
                      isWalletOnline === WalletOnlineStatus.Error ||
                      isWalletOnline === WalletOnlineStatus.InProgress ||
                      !isAmountEntryValid ||
                      invoiceLoading
                    }
                  />
                </View>
              </View>
            </>
          )}
        </View>

        <Modal
          visible={assetsDropdown}
          transparent
          animationType="slide"
          onRequestClose={() => setAssetsDropdown(false)}
          statusBarTranslucent
        >
          <View style={styles.assetsModalRoot}>
            <Pressable
              style={styles.assetsModalBackdrop}
              onPress={() => setAssetsDropdown(false)}
              accessibilityRole="button"
              accessibilityLabel="Close asset list"
            />
            <View
              style={[
                styles.assetsModalSheet,
                {
                  paddingBottom: Math.max(insets.bottom, hp(16)),
                },
              ]}
            >
              <RGBAssetList
                presentation="modal"
                assets={
                  (data as { records?: Asset[] } | undefined)?.records ??
                  assetsData
                }
                callback={item => {
                  Keyboard.dismiss();
                  const row = item as Asset & { asset?: Asset };
                  setSelectedAsset(row?.asset ?? row);
                  setAssetsDropdown(false);
                  setAssetId(row?.assetId || row?.asset?.assetId);
                  setAmount('');
                }}
                searchAssetInput={searchAssetInput}
                onChangeSearchInput={(text: string) => {
                  setSearchAssetInput(text);
                }}
                selectedAsset={selectedAsset as unknown as Asset[]}
                onDissmiss={() => setAssetsDropdown(false)}
                isLoading={isRegistrySearchLoading}
              />
            </View>
          </View>
        </Modal>

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
                (
                  navigation as unknown as {
                    replace: (name: string) => void;
                  }
                ).replace(NavigationRoutes.RECEIVESCREEN);
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
