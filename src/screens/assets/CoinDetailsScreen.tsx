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
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
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
import { hp, windowHeight, wp } from 'src/constants/responsive';
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
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import GradientBorderAnimated from '../home/GradientBorderAnimated';
import AnimatedDots from 'src/components/AnimatedDots';

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const hasShownPostModal = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { assetId, askReview, askVerify, isAddedToRegistry } = useRoute().params;
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
  const domainVerification = coin?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.DOMAIN,
  );
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, isThemeDark);
  const [loading, setLoading] = useState(false);
  const [participatedCampaigns, setParticipatedCampaigns] = useMMKVString(
    Keys.PARTICIPATED_CAMPAIGNS,
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

  const isEligibleForCampaign = useMemo(() => {
    if(coin?.campaign.exclusive === 'true') {
      const participatedCampaignsArray = JSON.parse(
        participatedCampaigns || '[]',
      );
      return !participatedCampaignsArray.includes(coin?.campaign._id);
    }
    return true;
  }, [participatedCampaigns, coin?.campaign._id]);

  const isBalanceRequired = useMemo(() => {
    if(coin?.campaign.mode === 'WITNESS') {
      return false;
    }
    if (!isEligibleForCampaign) return false;
    return (
      wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed === 0
    );
  }, [
    wallet.specs.balances.confirmed,
    wallet.specs.balances.unconfirmed,
    isEligibleForCampaign,
    coin?.campaign.mode,
  ]);

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

  const onClaimCampaign = async () => {
    setLoading(true);
    try {
      const result = await ApiHandler.claimCampaign(
        coin.campaign._id,
        coin.campaign.mode,
      );
      if (result.claimed) {
        Toast(result.message, false);
        if (coin.campaign.exclusive === 'true') {
          const participatedCampaignsArray = JSON.parse(
            participatedCampaigns || '[]',
          );
          participatedCampaignsArray.push(coin.campaign._id);
          setParticipatedCampaigns(JSON.stringify(participatedCampaignsArray));
        }
      } else {
        if (result.error === 'Insufficient sats for RGB') {
          Toast(
            'Add some sats in your bitcoin wallet to claim RGB assets',
            true,
          );
        } else {
          Toast(result.error || result.message, true);
        }
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignButtonText = useMemo(() => {
    if (loading) {
      return 'Requesting';
    }
    if (isEligibleForCampaign) {
      return coin.campaign.buttonText;
    }
    return 'Claimed';
  }, [isEligibleForCampaign, loading, coin.campaign.buttonText]);

  return (
    <ScreenContainer>
      {/* {loading && <ModalLoading visible={loading} />} */}
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
      {coin.campaign.isActive === 'true' && (
        <GradientBorderAnimated
          style={styles.gradientBorderCard}
          radius={hp(20)}
          strokeWidth={2}
          height={isBalanceRequired? hp(100):hp(84)}
          disabled={!isEligibleForCampaign}>
          <View style={[styles.campaignContainer, { height: isBalanceRequired? hp(96):hp(80)}]}>
            <View style={[styles.row, { marginHorizontal: wp(4), }]}>
              <View style={styles.campaignDescription}>
                <AppText
                  numberOfLines={2}
                  style={
                    isBalanceRequired
                      ? {
                          opacity: 0.5,
                          marginHorizontal: wp(4),
                        }
                      : { marginHorizontal: wp(4), }
                  }
                  variant="body1">
                  {getCampaignButtonText === 'Claimed' ? 'Claim submitted successfully. Distribution may take time.' : coin.campaign.description}
                </AppText>
              </View>
              <AppTouchable
                style={
                  isBalanceRequired ? styles.btnClaimDisabled : styles.btnClaim
                }
                disabled={isBalanceRequired || loading}
                onPress={() => {
                  onClaimCampaign();
                }}>
                <AppText
                  style={
                    isBalanceRequired
                      ? styles.btnClaimTextDisabled
                      : styles.btnClaimText
                  }
                  variant="body1">
                  {getCampaignButtonText}
                </AppText>
                {loading && <AnimatedDots />}
              </AppTouchable>
            </View>
            {isBalanceRequired && (
              <AppText variant="caption" style={styles.textAddsats}>
                Please add a small amount of Bitcoin (sats) to your wallet.
              </AppText>
            )}
          </View>
        </GradientBorderAnimated>
      )}
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
          isAddedToRegistry={isAddedToRegistry}
          primaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setRefresh(prev => !prev);
            setHasIssuedAsset(false);
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

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
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
    campaignContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isThemeDark ? '#24262B' : '#E9EEEF',
      borderRadius: hp(20),
      margin: hp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textAddsats: {
      marginTop: hp(10),
      textAlign: 'center',
      fontWeight: '500',
    },
    campaignDescription: {
      flex: 1,
      marginHorizontal: hp(5),
    },
    btnClaim: {
      backgroundColor: isThemeDark ? '#fff' : '#091229',
      padding: hp(5),
      paddingHorizontal: hp(15),
      borderRadius: hp(20),
      marginRight: hp(10),
      marginLeft: hp(5),
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnClaimDisabled: {
      borderColor: isThemeDark ? '#fff' : '#091229',
      borderWidth: 1,
      padding: hp(5),
      paddingHorizontal: hp(15),
      borderRadius: hp(20),
      marginRight: hp(10),
      marginLeft: hp(5),
      opacity: 0.5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnClaimText: {
      color: isThemeDark ? '#000' : '#fff',
      fontSize: 14,
    },
    btnClaimTextDisabled: {
      color: isThemeDark ? '#fff' : '#091229',
    },
    gradientBorderCard: {
      marginBottom: hp(10),
    },
  });
