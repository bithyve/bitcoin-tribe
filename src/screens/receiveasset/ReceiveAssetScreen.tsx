import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useMutation } from 'react-query';
import { useQuery } from '@realm/react';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVNumber } from 'react-native-mmkv';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import {
  InvoiceMode,
  Asset,
  Coin,
  Collectible,
} from 'src/models/interfaces/RGBWallet';
import Toast from 'src/components/Toast';
import { Keys } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import { hp, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectYourAsset from './SelectYourAsset';
import RGBAssetList from './RGBAssetList';
import InvoiceExpirySlider from './components/InvoiceExpirySlider';
import ReceiveInvoiceTypeToggle from './components/ReceiveInvoiceTypeToggle';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import UncheckIcon from 'src/assets/images/uncheckIcon.svg';
import UncheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import TextField from 'src/components/TextField';
import config, { APP_STAGE } from 'src/utils/config';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useReceiveAssetInvoiceFlow } from './useReceiveAssetInvoiceFlow';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowd_light.svg';
import IconArrowUp from 'src/assets/images/icon_arrowUp.svg';
import IconArrowUpLight from 'src/assets/images/icon_arrowUp_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import CopyIcon from 'src/assets/images/copyOutline.svg';
import CopyIconLight from 'src/assets/images/copyOutlineLight.svg';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';
import PrimaryCTA from 'src/components/PrimaryCTA';
import Clipboard from '@react-native-clipboard/clipboard';
import useWallets from 'src/hooks/useWallets';
import dbManager from 'src/storage/realm/dbManager';
import { RgbUnspent, RGBWallet } from 'src/models/interfaces/RGBWallet';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';
import { AppStackParams } from 'src/navigation/types';

type ReceiveAssetRouteProp = RouteProp<
  AppStackParams,
  NavigationRoutes.RECEIVEASSET
>;
type ReceiveAssetNavigationProp = NativeStackNavigationProp<
  AppStackParams,
  NavigationRoutes.RECEIVEASSET
>;

function ReceiveAssetScreen() {
  const { translations, formatString } = useContext(LocalizationContext);
  const {
    receciveScreen,
    assets,
    wallet: walletTranslation,
    sendScreen,
  } = translations;
  const theme: AppTheme = useTheme();
  const route = useRoute<ReceiveAssetRouteProp>();
  const navigation = useNavigation<ReceiveAssetNavigationProp>();
  const invoiceAssetId: string = route?.params?.invoiceAssetId || '';
  const chosenAsset: Asset | null = route?.params?.chosenAsset || null;
  const lockAssetSelection: boolean =
    route?.params?.lockAssetSelection || false;

  const [assetId, setAssetId] = useState<string>(invoiceAssetId || '');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    chosenAsset || null,
  );

  const [invoiceExpiry, setInvoiceExpiry] = useMMKVNumber(Keys.INVOICE_EXPIRY);
  const [invoiceType, setInvoiceType] = useState<InvoiceMode>(
    InvoiceMode.Blinded,
  );
  const [useWatchTower, setUseWatchTower] = useState(false);
  const [insufficientVisible, setInsufficientVisible] = useState(false);

  const [amountCommittedDisplay, setAmountCommittedDisplay] = useState('');
  const [amountCommittedSmallest, setAmountCommittedSmallest] = useState<
    '' | number
  >('');
  const [amountDraft, setAmountDraft] = useState('');
  const [assetsDropdown, setAssetsDropdown] = useState(false);
  const [expanded, setExpanded] = useState<'amount' | 'expiry' | null>(null);

  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const coins = useQuery<Coin>(RealmSchema.Coin).filtered(
    "visibility != 'HIDDEN'",
  );
  const collectibles = useQuery<Collectible>(RealmSchema.Collectible).filtered(
    "visibility != 'HIDDEN'",
  );
  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [
      ...(coins.toJSON() as any),
      ...(collectibles.toJSON() as any),
    ];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const {
    mutateAsync,
    isLoading: isSearching,
    data,
    reset,
  } = useMutation(({ query }: { query: string }) =>
    ApiHandler.searchAssetFromRegistry(query),
  );
  const [searchAssetInput, setSearchAssetInput] = useState('');

  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  useEffect(() => {
    if (invoiceExpiry === undefined) {
      setInvoiceExpiry(43200);
    }
  }, [invoiceExpiry, setInvoiceExpiry]);

  useEffect(() => {
    const trimmed = searchAssetInput.trim();
    if (trimmed.length === 0) {
      reset();
      return;
    }
    mutateAsync({ query: trimmed });
  }, [mutateAsync, reset, searchAssetInput]);

  const onBackNavigation = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: NavigationRoutes.HOME }],
      }),
    );
  };

  const precision = selectedAsset?.precision ?? 0;
  const normalizeAmountForParse = (raw: string) =>
    raw.replace(/\s/g, '').replace(/,/g, '.');
  const isAmountEntryValid = useMemo(() => {
    if (amountDraft === '') return true;
    if (precision === 0) {
      return /^[1-9]\d*$/.test(amountDraft);
    }
    const fractional = new RegExp(`^(0|[1-9]\\d*)([.,]\\d{0,${precision}})?$`);
    if (!fractional.test(amountDraft)) return false;
    const n = Number(normalizeAmountForParse(amountDraft));
    return !Number.isNaN(n) && n > 0;
  }, [amountDraft, precision]);

  const checkIcon = useMemo(() => {
    if (isThemeDark) {
      return useWatchTower ? <CheckIcon /> : <UncheckIcon />;
    }
    return useWatchTower ? <CheckIconLight /> : <UncheckIconLight />;
  }, [isThemeDark, useWatchTower]);

  const chevronAmount = useMemo(() => {
    const expandedNow = expanded === 'amount';
    if (isThemeDark) {
      return expandedNow ? <IconArrowUp /> : <IconArrowDown />;
    }
    return expandedNow ? <IconArrowUpLight /> : <IconArrowDownLight />;
  }, [expanded, isThemeDark]);

  const chevronExpiry = useMemo(() => {
    const expandedNow = expanded === 'expiry';
    if (isThemeDark) {
      return expandedNow ? <IconArrowUp /> : <IconArrowDown />;
    }
    return expandedNow ? <IconArrowUpLight /> : <IconArrowDownLight />;
  }, [expanded, isThemeDark]);

  const handleAmountDraftChange = (text: string) => {
    if (text === '') {
      setAmountDraft('');
      return;
    }
    let regex: RegExp;
    if (precision === 0) {
      regex = /^[1-9]\d*$/;
    } else {
      regex = new RegExp(`^(0|[1-9]\\d*)([.,]\\d{0,${precision}})?$`);
    }
    if (regex.test(text)) {
      setAmountDraft(text);
    }
  };

  const { loading, qrValue, requestInvoice, clearInvoice, error } =
    useReceiveAssetInvoiceFlow({
      assetId,
      amount: amountCommittedSmallest === '' ? 0 : amountCommittedSmallest,
      invoiceExpiry: invoiceExpiry ?? 43200,
      invoiceType,
      useWatchTower,
      onFatalErrorGoBack: () => {},
      strings: {
        assetsInsufficientSats: assets.insufficientSats,
        assetsAssetProcessErrorMsg: assets.assetProcessErrorMsg,
        walletFailedToCreateUTXO: walletTranslation.failedToCreateUTXO,
      },
      formatString: formatString as any,
    });

  useEffect(() => clearInvoice, [clearInvoice]);

  const wallet = useWallets({}).wallets[0];
  const rgbWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  ) as RGBWallet;
  const unspent: RgbUnspent[] = useMemo(
    () =>
      rgbWallet?.utxos?.map((u: any) =>
        typeof u === 'string' ? JSON.parse(u) : u,
      ) ?? [],
    [rgbWallet?.utxos],
  );
  const colorable = useMemo(
    () =>
      unspent.filter(
        utxo =>
          utxo.utxo?.colorable === true &&
          utxo.rgbAllocations?.length === 0 &&
          utxo.pendingBlinded === 0,
      ),
    [unspent],
  );
  const canProceed = useMemo(() => {
    return (
      (wallet?.specs?.balances?.confirmed ?? 0) +
        (wallet?.specs?.balances?.unconfirmed ?? 0) >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    wallet?.specs?.balances?.confirmed,
    wallet?.specs?.balances?.unconfirmed,
  ]);

  useEffect(() => {
    // Centralized invoice creation: debounce to avoid churn and ensure params are fresh.
    if (!canProceed && invoiceType === InvoiceMode.Blinded) {
      clearInvoice?.();
      setInsufficientVisible(true);
      return () => {};
    }

    const t = setTimeout(() => {
      requestInvoice();
    }, 350);

    return () => clearTimeout(t);
  }, [
    assetId,
    amountCommittedSmallest,
    invoiceExpiry,
    invoiceType,
    useWatchTower,
  ]);

  const saveAmount = () => {
    if (amountDraft !== '' && !isAmountEntryValid) {
      const n = Number(normalizeAmountForParse(amountDraft));
      Toast(
        !Number.isNaN(n) && n <= 0
          ? sendScreen.validationZeroNotAllowed
          : sendScreen.invoiceFormatErrMsg,
        true,
      );
      return;
    }

    setAmountCommittedDisplay(amountDraft);
    if (amountDraft === '') {
      setAmountCommittedSmallest('');
    } else {
      const normalized = normalizeAmountForParse(amountDraft);
      const v =
        precision === 0
          ? Number(normalized)
          : Number(normalized) * 10 ** precision;
      setAmountCommittedSmallest(v);
    }
    setExpanded(null);
    Keyboard.dismiss();
  };

  const cancelAmount = () => {
    setAmountDraft(amountCommittedDisplay);
    setExpanded(null);
    Keyboard.dismiss();
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={'Receive Asset'}
        enableBack={true}
        onBackNavigation={onBackNavigation}
        style={{ marginTop: 0 }}
      />

      <View>
        <ResponsePopupContainer
          visible={loading}
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
        <ResponsePopupContainer
          visible={insufficientVisible}
          enableClose={true}
          onDismiss={() => setInsufficientVisible(false)}
          backColor={theme.colors.cardGradient1}
          borderColor={theme.colors.borderColor}
        >
          <InsufficiantBalancePopupContainer
            primaryOnPress={() => {
              setInsufficientVisible(false);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.RECEIVESCREEN);
              }, 500);
            }}
            secondaryOnPress={() => setInsufficientVisible(false)}
          />
        </ResponsePopupContainer>
      </View>
      {!loading && !error && (
        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.toggleRow}>
              <ReceiveInvoiceTypeToggle
                value={invoiceType}
                privateLabel={receciveScreen.privateLabel ?? 'Private'}
                prepaidLabel={receciveScreen.prepaidLabel ?? 'Pre-paid'}
                onChange={(value: InvoiceMode) => {
                  setInvoiceType(value);
                  if (value === InvoiceMode.Blinded && !canProceed) {
                    setInsufficientVisible(true);
                    return;
                  }
                }}
              />
            </View>

            {qrValue && (
              <View style={styles.qrContainer}>
                <ShowQRCode
                  value={qrValue}
                  title={''}
                  qrTitleColor={theme.colors.btcCtaBackColor}
                />
                <AppTouchable
                  style={styles.copyIconWrapper}
                  onPress={() => {
                    Clipboard.setString(qrValue);
                    Toast('Invoice copied to clipboard!', false);
                  }}
                >
                  {theme.dark ? (
                    <CopyIcon height={18} width={18} />
                  ) : (
                    <CopyIconLight height={18} width={18} />
                  )}
                  <AppText variant="subTitle">Tap to copy</AppText>
                </AppTouchable>
              </View>
            )}

            <View style={styles.optionsContainer}>
              <SelectYourAsset
                selectedAsset={selectedAsset as any}
                selectionLocked={lockAssetSelection}
                onPress={() => {
                  if (lockAssetSelection) return;
                  setAssetsDropdown(true);
                }}
              />
              <View>
                <View style={styles.optionCard}>
                  <Pressable
                    onPress={() =>
                      setExpanded(prev => (prev === 'amount' ? null : 'amount'))
                    }
                    style={styles.accordionHeader}
                  >
                    <AppText variant="body3" style={styles.rowTitle}>
                      {receciveScreen.addAmountOptional}
                    </AppText>
                    <View>{chevronAmount}</View>
                  </Pressable>
                </View>
                {expanded === 'amount' && (
                  <View style={styles.accordionBody}>
                    <AppText variant="body3" style={styles.sectionLabel}>
                      Add Amount
                    </AppText>
                    <TextField
                      value={amountDraft}
                      onChangeText={handleAmountDraftChange}
                      placeholder={
                        receciveScreen.placeHolderText || assets.amount
                      }
                      keyboardType="numeric"
                      style={styles.amountInput}
                    />
                    <AppText style={styles.helperText}>
                      {receciveScreen.amountReservedHint}
                    </AppText>
                    <View style={styles.amountActions}>
                      <AppTouchable onPress={cancelAmount}>
                        <AppText variant="body1Bold" style={styles.cancelText}>
                          Cancel
                        </AppText>
                      </AppTouchable>
                      <PrimaryCTA
                        title={'Save'}
                        onPress={saveAmount}
                        width={wp(120)}
                        disabled={!isAmountEntryValid}
                        height={hp(15)}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Expiry Option Card */}
              <View>
                <View style={styles.optionCard}>
                  <Pressable
                    onPress={() =>
                      setExpanded(prev => (prev === 'expiry' ? null : 'expiry'))
                    }
                    style={styles.accordionHeader}
                  >
                    <AppText variant="body3" style={styles.rowTitle}>
                      {receciveScreen.invoiceExpiry ?? 'Invoice expiry'}
                    </AppText>
                    <View style={styles.expiryRight}>
                      <AppText variant="body2" style={styles.expiryValue}>
                        {`${
                          Math.round(((invoiceExpiry ?? 43200) / 3600) * 10) /
                          10
                        } hr`}
                      </AppText>
                      {chevronExpiry}
                    </View>
                  </Pressable>
                </View>
                {expanded === 'expiry' && (
                  <InvoiceExpirySlider
                    value={invoiceExpiry ?? 43200}
                    onValueChange={val => {
                      setInvoiceExpiry(val);
                    }}
                  />
                )}
              </View>

              {config.ENVIRONMENT != APP_STAGE.PRODUCTION && (
                <Pressable
                  onPress={() => {
                    setUseWatchTower(prev => !prev);
                  }}
                  style={styles.watchtowerCtr}
                >
                  <View style={styles.checkIconWrapper}>{checkIcon}</View>
                  <View style={styles.watchtowerTextWrapper}>
                    <AppText variant="body2" style={styles.watchtowerText}>
                      {receciveScreen.validateUsingWatchTower}
                    </AppText>
                  </View>
                </Pressable>
              )}

              {invoiceType === InvoiceMode.Witness && (
                <View style={styles.prepaidCard}>
                  <AppText variant="caption" style={styles.prepaidText}>
                    {receciveScreen.prepaidExplainer}
                  </AppText>
                  <View style={{ flexDirection: 'row', marginTop: hp(10) }}>
                    <AppText variant="caption" style={styles.prepaidText}>
                      Currently supported app:
                    </AppText>
                    <AppText
                      variant="body5"
                      style={{
                        color: isThemeDark
                          ? Colors.Golden
                          : Colors.BrandeisBlue,
                      }}
                    >
                      {' Bitcoin Tribe'}
                    </AppText>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {assetsDropdown && (
            <RGBAssetList
              assets={
                (data as any)?.records ? (data as any).records : assetsData
              }
              callback={(item: any) => {
                Keyboard.dismiss();
                const picked: Asset = (item as any)?.asset ?? item;
                setSelectedAsset(picked);
                setAssetsDropdown(false);
                setAssetId(
                  (picked as any)?.assetId ||
                    (picked as any)?.asset?.assetId ||
                    '',
                );
                setSearchAssetInput('');
                setAmountDraft('');
                setAmountCommittedDisplay('');
                setAmountCommittedSmallest('');
              }}
              searchAssetInput={searchAssetInput}
              onChangeSearchInput={(text: string) => setSearchAssetInput(text)}
              selectedAsset={selectedAsset as any}
              onDissmiss={() => setAssetsDropdown(false)}
              isLoading={isSearching}
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    advanceOptionStyle: {
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: insets.bottom,
      left: wp(20),
      right: wp(20),
    },
    body: { flex: 1 },
    toggleRow: { marginBottom: hp(10), marginHorizontal: wp(16) },
    scrollContent: {
      paddingBottom: hp(120),
    },
    qrContainer: {
      marginTop: hp(10),
    },
    optionsContainer: {
      marginTop: hp(10),
      marginHorizontal: wp(16),
    },
    assetsDropdownContainer: {
      position: 'absolute',
      borderRadius: 20,
      left: 0,
      right: 0,
      top: 0,
      zIndex: 20,
    },
    optionCard: {
      marginTop: hp(10),
      experimental_backgroundImage: `linear-gradient(45deg,#1A1A1A,#0B0B0B, #121212)`,
      borderRadius: 15,
    },
    accordionCard: { marginTop: hp(10) },
    accordionHeader: {
      paddingVertical: hp(14),
      paddingHorizontal: wp(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    accordionBody: {
      paddingHorizontal: wp(12),
      paddingBottom: hp(12),
      backgroundColor: theme.colors.modalBackColor,
      marginTop: hp(5),
      borderRadius: 15,
      padding: wp(20),
    },
    rowTitle: { color: theme.colors.text },
    sectionLabel: { color: theme.colors.mutedTab, marginBottom: hp(10) },
    amountInput: {
      marginTop: hp(4),
      backgroundColor: theme.colors.roundedCtaBg,
    },
    helperText: {
      marginTop: hp(6),
      color: theme.colors.mutedTab,
      fontSize: 12,
      fontFamily: Fonts.LufgaLight,
      fontStyle: 'italic',
    },
    amountActions: {
      marginTop: hp(20),
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: wp(10),
    },
    watchtowerCtr: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(15),
    },
    checkIconWrapper: { width: '10%' },
    watchtowerTextWrapper: { width: '90%' },
    watchtowerText: { color: '#B9BCC4' },
    expiryRight: { flexDirection: 'row', alignItems: 'center' },
    expiryValue: { color: Colors.Golden, marginRight: wp(8) },
    prepaidCard: {
      marginTop: hp(12),
      paddingHorizontal: wp(12),
      paddingVertical: hp(12),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.Golden,
    },
    prepaidText: { color: theme.colors.text },
    cancelText: {
      color: theme.colors.mutedTab,
      paddingVertical: hp(10),
    },
    copyIconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(4),
      alignSelf: 'center',
      marginTop: hp(15),
    },
  });

export default ReceiveAssetScreen;
