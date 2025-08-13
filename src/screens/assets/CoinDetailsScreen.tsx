import { Animated, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { MMKV, useMMKVBoolean } from 'react-native-mmkv';
import { setGenericPassword, getGenericPassword } from 'react-native-keychain';
import {
  Coin,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import TransactionsList from './TransactionsList';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import { Keys } from 'src/storage';
import CoinDetailsHeader from './CoinDetailsHeader';
import { hp, windowHeight } from 'src/constants/responsive';
import { requestAppReview } from 'src/services/appreview';
import VerifyIssuerModal from './components/VerifyIssuerModal';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import {
  updateAssetIssuedPostStatus,
  updateAssetPostStatus,
} from 'src/utils/postStatusUtils';
import Toast from 'src/components/Toast';
import DisclaimerPopup from 'src/components/DisclaimerPopup';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const hasShownPostModal = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { assetId, askReview, askVerify } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;

  const {
    appType,
    hasCompleteVerification,
    setCompleteVerification,
    hasIssuedAsset,
    setHasIssuedAsset,
    isNodeInitInProgress,
    isDisclaimerVisible,
    setIsDisclaimerVisible,
  } = useContext(AppContext);
  const mmkv = new MMKV();
  const theme: AppTheme = useTheme();
  const wallet: Wallet = useWallets({}).wallets[0];
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { mutate: getChannelMutate, data: channelsData } = useMutation(
    ApiHandler.getChannels,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [openTwitterAfterVerifyClose, setOpenTwitterAfterVerifyClose] =
    useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isSharingToTwitter, setIsSharingToTwitter] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [claimDisabled, setClaimDisabled] = useState(false);
  const styles = React.useMemo(
    () => getStyles(theme, claimDisabled),
    [theme, claimDisabled],
  );

  const domainVerification = coin?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.DOMAIN,
  );

  useEffect(() => {
    if (hasIssuedAsset) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
      }, 1000);
    }
  }, [hasIssuedAsset]);

  useEffect(() => {
    if (!showVerifyModal && openTwitterAfterVerifyClose) {
      setTimeout(() => {
        setVisiblePostOnTwitter(true);
        setOpenTwitterAfterVerifyClose(false);
      }, 1000);
    }
  }, [showVerifyModal, openTwitterAfterVerifyClose]);

  useEffect(() => {
    if (askVerify) {
      setTimeout(() => setShowVerifyModal(true), 1000);
    }
  }, [askVerify]);

  useEffect(() => {
    if (askReview && refresh) {
      setTimeout(() => {
        requestAppReview();
      }, 2000);
    }
  }, [askReview, refresh]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        coin?.issuer?.verified &&
        hasCompleteVerification &&
        !hasShownPostModal.current
      ) {
        hasShownPostModal.current = true;
        setTimeout(() => {
          setVisiblePostOnTwitter(true);
        }, 1000);
      }
    }, [coin?.issuer?.verified, hasCompleteVerification]),
  );

  useEffect(() => {
    const selectedAssetName = coin?.name;
    const unsubscribe = navigation.addListener('focus', () => {
      if (selectedAssetName !== 'Tribe tUSDt') {
        refreshRgbWallet.mutate();
        mutate({ assetId, schema: RealmSchema.Coin });
      }
      if (
        appType === AppType.NODE_CONNECT ||
        appType === AppType.SUPPORTED_RLN
      ) {
        listPaymentshMutation.mutate();
        getChannelMutate();
      }
    });
    return unsubscribe;
  }, [navigation, assetId]);

  useEffect(() => {
    checkClaimStatus();
  }, []);

  async function checkClaimStatus() {
    if (mmkv.getString(Keys.CLAIM_KEY) === 'true') {
      setClaimDisabled(true);
      return;
    }
    const keychainData = await getGenericPassword({
      service: Keys.CLAIM_KEYCHAIN_ACCOUNT,
    });
    console.log('keychainData', keychainData);
    if (keychainData) {
      setClaimDisabled(true);
      mmkv.set(Keys.CLAIM_KEY, 'true');
    }
  }

  const totalAssetLocalAmount = useMemo(() => {
    const safeChannelsData = Array.isArray(channelsData) ? channelsData : [];
    return safeChannelsData
      .filter(channel => channel.asset_id === assetId)
      .reduce((sum, channel) => sum + (channel.asset_local_amount || 0), 0);
  }, [channelsData, assetId]);

  const filteredPayments = (listPaymentshMutation.data?.payments || []).filter(
    payment => payment.asset_id === assetId,
  );

  const transactionsData =
    appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
      ? Object.values({
          ...filteredPayments,
          ...coin?.transactions,
        }).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime() || 0;
          const dateB = new Date(b.createdAt).getTime() || 0;
          return dateA - dateB;
        })
      : coin?.transactions.slice(0, 4);

  const rawHtml = isThemeDark
    ? coin?.disclaimer?.contentDark
    : coin?.disclaimer?.contentLight;

  const disclaimerHtml = rawHtml;

  const navigateWithDelay = (callback: () => void) => {
    setTimeout(() => {
      callback();
    }, 1000);
  };

  async function onClaimPress() {
    mmkv.set(Keys.CLAIM_KEY, 'true');
    await setGenericPassword('claim', 'true', {
      service: Keys.CLAIM_KEYCHAIN_ACCOUNT,
    });
    setClaimDisabled(true);
  }

  return (
    <ScreenContainer>
      <CoinDetailsHeader
        asset={coin}
        // smallHeaderOpacity={smallHeaderOpacity}
        // largeHeaderHeight={largeHeaderHeight}
        headerRightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
        onPressSend={() => {
          if (isNodeInitInProgress) {
            Toast(node.connectingNodeToastMsg, true);
            return;
          }
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: coin.assetId,
            rgbInvoice: '',
            wallet: wallet,
          });
        }}
        onPressReceive={() => {
          if (isNodeInitInProgress) {
            Toast(node.connectingNodeToastMsg, true);
            return;
          }
          navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
            invoiceAssetId: coin.assetId,
            chosenAsset: coin,
          });
        }}
        totalAssetLocalAmount={totalAssetLocalAmount}
      />
      <View style={styles.claimToolTipWrapper}>
        <View style={styles.claimMessageWrapper}>
          <AppText>🎁 Claim free USDT (1–10) and explore RGB now</AppText>
        </View>
        <View style={styles.claimCtaContainer}>
          <AppTouchable
            style={styles.claimCtaWrapper}
            onPress={() => onClaimPress()}>
            <AppText style={styles.claimCtaTitle}>
              {claimDisabled ? 'Claimed' : 'Claim Now'}
            </AppText>
          </AppTouchable>
        </View>
      </View>
      <TransactionsList
        style={
          appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
            ? styles.transactionContainer1
            : styles.transactionContainer
        }
        transactions={transactionsData}
        isLoading={isLoading}
        refresh={() => {
          setRefreshing(true);
          refreshRgbWallet.mutate();
          mutate({ assetId, schema: RealmSchema.Coin });
          setTimeout(() => setRefreshing(false), 2000);
        }}
        refreshingStatus={refreshing}
        navigation={navigation}
        wallet={wallet}
        coin={coin.name}
        assetId={assetId}
        precision={coin.precision}
        scrollY={scrollY}
        schema={RealmSchema.Coin}
      />

      <VerifyIssuerModal
        assetId={coin.assetId}
        isVisible={showVerifyModal}
        onVerify={() => {
          setShowVerifyModal(false);
          setTimeout(() => setVisiblePostOnTwitter(true), 1000);
        }}
        onDismiss={() => {
          setShowVerifyModal(false);
          setTimeout(() => setVisibleIssuedPostOnTwitter(true), 1000);
        }}
        onDomainVerify={() => {
          setShowVerifyModal(false);
          navigateWithDelay(() =>
            navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
              assetId: coin.assetId,
              schema: RealmSchema.Coin,
              savedDomainName: domainVerification?.name || '',
            }),
          );
        }}
        schema={RealmSchema.Coin}
        onVerificationComplete={() => {
          setRefreshToggle(t => !t);
          setShowVerifyModal(false);
          setTimeout(() => setVisiblePostOnTwitter(true), 1000);
        }}
        primaryLoading={refreshToggle}
      />
      <>
        <PostOnTwitterModal
          visible={visiblePostOnTwitter}
          primaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(coin, RealmSchema.Coin, assetId, false);
            updateAssetIssuedPostStatus(RealmSchema.Coin, assetId, true);
            setRefresh(prev => !prev);
            setIsSharingToTwitter(true);
          }}
          secondaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(coin, RealmSchema.Coin, assetId, false);
            updateAssetIssuedPostStatus(RealmSchema.Coin, assetId, true);
          }}
          issuerInfo={coin}
        />
      </>
      <>
        <IssueAssetPostOnTwitterModal
          visible={visibleIssuedPostOnTwitter}
          primaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setRefresh(prev => !prev);
            updateAssetIssuedPostStatus(RealmSchema.Coin, assetId, false);
          }}
          secondaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setHasIssuedAsset(false);
            setRefresh(prev => !prev);
            updateAssetIssuedPostStatus(RealmSchema.Coin, assetId, false);
          }}
          issuerInfo={coin}
        />
      </>
      <>
        {coin?.disclaimer?.showDisclaimer === 'true' && (
          <DisclaimerPopup
            visible={isDisclaimerVisible}
            primaryOnPress={() => setIsDisclaimerVisible(false)}
            primaryCtaTitle="Understood"
            disclaimerHtml={disclaimerHtml}
          />
        )}
      </>
    </ScreenContainer>
  );
};

export default CoinDetailsScreen;

const getStyles = (theme: AppTheme, disableStatus) =>
  StyleSheet.create({
    transactionContainer: {
      height: windowHeight > 820 ? '55%' : '50%',
    },
    transactionContainer1: {
      marginTop: hp(10),
      height: windowHeight > 820 ? '54%' : '49%',
    },
    toolTipCotainer: {
      top: windowHeight > 670 ? 90 : 70,
    },
    claimToolTipWrapper: {
      width: '100%',
      flexDirection: 'row',
      marginBottom: hp(5),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      paddingHorizontal: hp(10),
      paddingVertical: hp(5),
      borderRadius: 10,
      backgroundColor: theme.colors.inputBackground,
    },
    claimMessageWrapper: {
      width: '70%',
    },
    claimCtaContainer: {
      width: '30%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    claimCtaWrapper: {
      minHeight: hp(32),
      minWidth: hp(93),
      backgroundColor: disableStatus
        ? theme.colors.claimCtaDisableBackColor
        : theme.colors.claimCtaBackColor,
      borderWidth: 2,
      borderColor: theme.colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    },
    claimCtaTitle: {
      color: disableStatus
        ? theme.colors.claimCtaDisableTitleColor
        : theme.colors.claimCtaTitleColor,
    },
  });
