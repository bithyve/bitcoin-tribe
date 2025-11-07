import {
  ActivityIndicator,
  AppState,
  Dimensions,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import {
  TransferKind,
  AssetVisibility,
  UniqueDigitalAsset,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';
import { hp, wp } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import HideAssetView from './components/HideAssetView';
import dbManager from 'src/storage/realm/dbManager';
import AssetTransaction from '../wallet/components/AssetTransaction';
import VerifyIssuer from './components/VerifyIssuer';
import IssuerVerified from './components/IssuerVerified';
import { requestAppReview } from 'src/services/appreview';
import VerifyIssuerModal from './components/VerifyIssuerModal';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import {
  updateAssetIssuedPostStatus,
  updateAssetPostStatus,
} from 'src/utils/postStatusUtils';
import SelectOption from 'src/components/SelectOption';
import openLink from 'src/utils/OpenLink';
import IssuerDomainVerified from './components/IssuerDomainVerified';
import EmbeddedTweetView from 'src/components/EmbeddedTweetView';
import Relay from 'src/services/relay';
import ModalLoading from 'src/components/ModalLoading';
import config from 'src/utils/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTouchable from 'src/components/AppTouchable';
import SendIcon from 'src/assets/images/sendIcon.svg';
import SendIconLight from 'src/assets/images/icon_send_light.svg';
import DownloadIcon from 'src/assets/images/downloadOutline.svg';
import DownloadIconLight from 'src/assets/images/downloadOutlineLight.svg';
import CopyIcon from 'src/assets/images/copyOutline.svg';
import CopyIconLight from 'src/assets/images/copyOutlineLight.svg';
import InfoIcon from 'src/assets/images/infoOutline.svg';
import InfoIconLight from 'src/assets/images/infoOutlineLight.svg';
import ShareIcon from 'src/assets/images/shareOutline.svg';
import ShareIconLight from 'src/assets/images/shareOutlineLight.svg';
import Share from 'react-native-share';
import AppText from 'src/components/AppText';
import { NewAssetIdContainer } from './components/NewAssetIdContainer';
import Colors from 'src/theme/Colors';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';
import { SizedBox } from 'src/components/SizedBox';
import DeepLinking from 'src/utils/DeepLinking';
import { isWebUrl } from 'src/utils/url';
import BackTranslucent from 'src/assets/images/backTranslucent.svg';
import BackTranslucentLight from 'src/assets/images/backTranslucentLight.svg';
import { ZoomableImage } from 'src/components/ZoomableImage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const { height: screenHeight } = Dimensions.get('window');

type itemProps = {
  title: string;
  value: string;
  style?: StyleProp<ViewStyle>;
};

export const Item = ({ title, value, style }: itemProps) => {
  const theme: AppTheme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(theme, insets), [theme, insets]);
  return (
    <View style={[styles.itemWrapper, style]}>
      <AppText variant="heading2Bold" style={styles.valueText}>
        {value}
      </AppText>
      <AppText variant="body2" style={styles.labelText}>
        {title}
      </AppText>
      <View style={styles.divider} />
    </View>
  );
};

export const UDADetailsScreen = ({ route, data }) => {
  const insets = useSafeAreaInsets();
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);
  const hasShownPostModal = useRef(false);
  const appState = useRef(AppState.currentState);
  const {
    assetId,
    askReview,
    askVerify,
    showHeader = true,
    showFooter = true,
    showInfo = false,
  } = route?.params || data;
  const styles = React.useMemo(() => getStyles(theme, insets), [theme, insets]);
  const {
    appType,
    hasCompleteVerification,
    setCompleteVerification,
    hasIssuedAsset,
    setHasIssuedAsset,
  } = useContext(AppContext);
  const uda: UniqueDigitalAsset = useObject<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    assetId,
  ).toJSON() as UniqueDigitalAsset;

  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, common, home } = translations;
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [openTwitterAfterVerifyClose, setOpenTwitterAfterVerifyClose] =
    useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isVerifyingIssuer, setIsVerifyingIssuer] = useState(false);
  const [isAddedInRegistry, setIsAddedInRegistry] = useState(false);
  const [imageView, setImageView] = useState(true);
  const touchY = useRef(0);
  const [loadingImage, setLoadingImage] = useState(false);
  const isCollectionUda = uda?.details.includes(DeepLinking.scheme)

  const twitterVerification = uda?.issuer?.verifiedBy?.find(
    v =>
      v.type === IssuerVerificationMethod.TWITTER ||
      v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const twitterPostVerificationWithLink = uda?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST && v.link,
  );

  const domainVerification = uda?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.DOMAIN,
  );

  const hasIssuanceTransaction = uda?.transactions.some(
    transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
  );

  const verified = uda?.issuer?.verifiedBy?.some(
    item => item.verified === true,
  );

  const url = domainVerification?.name?.startsWith('http')
    ? domainVerification?.name
    : `https://${domainVerification?.name}`;

  useEffect(() => {
    if (hasIssuedAsset) {
      setTimeout(() => {
        setVisibleIssuedPostOnTwitter(true);
      }, 1000);
    }
  }, [hasIssuedAsset]);

  useFocusEffect(()=>{
    !showFooter &&
    setImageView(!showInfo)
  }
  );

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

  useEffect(() => {
    const fetchAsset = async () => {
      const asset = await Relay.getAsset(assetId);
      setIsAddedInRegistry(asset.status);
    };
    fetchAsset();
  }, [assetId, refreshToggle]);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (askReview && refresh) {
          setTimeout(() => {
            requestAppReview();
          }, 2000);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [askReview, refresh]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        uda?.issuer?.verified &&
        hasCompleteVerification &&
        !hasShownPostModal.current
      ) {
        hasShownPostModal.current = true;
        setTimeout(() => {
          setVisiblePostOnTwitter(true);
        }, 1000);
      }
    }, [uda?.issuer?.verified, hasCompleteVerification]),
  );

  const showVerifyIssuer = useMemo(() => {
    return (
      !twitterVerification?.id &&
      uda?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [uda?.transactions, uda.issuer?.verifiedBy, refreshToggle]);

  const showDomainVerifyIssuer = useMemo(() => {
    return (
      !domainVerification?.verified &&
      uda?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [uda?.transactions, uda?.issuer?.verifiedBy, refreshToggle]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.UniqueDigitalAsset });
      if (
        appType === AppType.NODE_CONNECT ||
        appType === AppType.SUPPORTED_RLN
      ) {
        listPaymentshMutation.mutate();
      }
    });
    return unsubscribe;
  }, [navigation, assetId]);

  const hideAsset = () => {
    dbManager.updateObjectByPrimaryId(
      RealmSchema.UniqueDigitalAsset,
      'assetId',
      assetId,
      {
        visibility: AssetVisibility.HIDDEN,
      },
    );
    navigation.dispatch(popAction);
  };

  const navigateWithDelay = (callback: () => void) => {
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const onShare = async filePath => {
    try {
      const options = {
        url: filePath,
      };
      await Share.open(options);
    } catch (error) {
      console.log('Error sharing file:', error);
    }
  };

  const onCopyAssetId = async () => {
    await Clipboard.setString(assetId);
    Toast(common.assetIDCopySuccessfully);
  };

  const onShareAssetId = async () => {
    try {
      const shareOptions = { message: assetId };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing asset ID:', error);
    }
  };

  const mediaPath = useMemo(() => {
    const media = uda?.media?.filePath || uda?.token?.media?.filePath;
    if (media) {
      if (isWebUrl(media)) {
        return media;
      }
      return Platform.select({
        android: `file://${media}`,
        ios: media,
      });
    }
    return null;
  }, [uda?.media?.filePath, uda?.token?.media?.filePath]);

  return (
    <>
    <GestureHandlerRootView>
      {imageView && showFooter && (
        <View style={styles.bottomContainer}>
          <AppTouchable
            disabled={uda?.balance?.spendable < 1}
            style={[
              styles.roundCtaCtr,
              uda?.balance?.spendable < 1 && { opacity: 0 },
            ]}
            onPress={() =>
              // @ts-ignore
              navigation.navigate(NavigationRoutes.SCANASSET, {
                assetId: assetId,
                rgbInvoice: '',
                isUDA: true,
              })
            }>
            {theme.dark ? (
              <SendIcon height={22} width={22} />
            ) : (
              <SendIconLight height={22} width={22} />
            )}
          </AppTouchable>
          <View style={styles.bottomCenterCta}>
            <AppTouchable hitSlop={10} onPress={onShareAssetId}>
              {theme.dark ? (
                <ShareIcon height={22} width={22} />
              ) : (
                <ShareIconLight height={22} width={22} />
              )}
            </AppTouchable>
            <AppTouchable
              hitSlop={10}
              onPress={() => {
                setImageView(!imageView);
              }}>
              {theme.dark ? (
                <InfoIcon height={22} width={22} />
              ) : (
                <InfoIconLight height={22} width={22} />
              )}
            </AppTouchable>
            <AppTouchable hitSlop={10} onPress={onCopyAssetId}>
              {theme.dark ? (
                <CopyIcon height={22} width={22} />
              ) : (
                <CopyIconLight height={22} width={22} />
              )}
            </AppTouchable>
          </View>
          <AppTouchable
            style={styles.roundCtaCtr}
            onPress={() => {
              const filePath = Platform.select({
                android: `file://${uda?.token?.media.filePath}`,
                ios: `${uda?.token?.media.filePath}`,
              });
              onShare(filePath);
            }}>
            {theme.dark ? (
              <DownloadIcon height={22} width={22} />
            ) : (
              <DownloadIconLight height={22} width={22} />
            )}
          </AppTouchable>
        </View>
      )}

      <ScrollView
        style={styles.dataContainer}
        bounces={false}
        scrollEnabled={!imageView}
        showsVerticalScrollIndicator={!imageView}
        contentContainerStyle={{ flex: imageView ? 1 : 0 }}
        overScrollMode="never">
        {showHeader && (
          <AppHeader
            title={imageView ? '' : assets.udaDetails}
            style={styles.headerStyle}
            backIcon={ isThemeDark? <BackTranslucent />: <BackTranslucentLight/>}
          />
        )}
        <View style={[!imageView && { maxHeight: hp(375) }]}>
          <ZoomableImage uri={mediaPath} imageView={imageView} setLoadingImage={setLoadingImage} min={1} max={3}
          />
          {loadingImage && <View style={styles.loaderAbsoluteFill}><ActivityIndicator/></View> }
        </View>
        {imageView ? (
          <></>
        ) : (
          <>
            {isVerifyingIssuer ? (
              <ModalLoading visible={isVerifyingIssuer} />
            ) : (
              <>
                <SizedBox height={hp(15)} />
                <IssuerVerified
                  id={twitterVerification?.id}
                  name={twitterVerification?.name}
                  username={twitterVerification?.username.replace(/@/g, '')}
                  assetId={assetId}
                  schema={RealmSchema.UniqueDigitalAsset}
                  onVerificationComplete={() => setRefreshToggle(t => !t)}
                  setIsVerifyingIssuer={setIsVerifyingIssuer}
                  hasIssuanceTransaction={hasIssuanceTransaction}
                />
                <IssuerDomainVerified
                  domain={
                    uda?.issuer?.verifiedBy?.find(
                      v => v.type === IssuerVerificationMethod.DOMAIN,
                    )?.name
                  }
                  verified={domainVerification?.verified}
                  onPress={() => {
                    if (domainVerification?.verified) {
                      openLink(url);
                    } else {
                      navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
                        assetId: assetId,
                        schema: RealmSchema.UniqueDigitalAsset,
                        savedDomainName: domainVerification?.name || '',
                      });
                    }
                  }}
                  hasIssuanceTransaction={hasIssuanceTransaction}
                />
                <Item
                  title={assets.issuedOn}
                  value={moment
                    .unix(uda?.timestamp as number)
                    .format('DD MMM YY  hh:mm A')}
                />
                <Item title={home.udaName} value={uda.name as string} />
                <Item title={home.assetTicker} value={uda.ticker as string} />
                <View style={styles.gutter}>
                  <NewAssetIdContainer assetId={assetId} />
                </View>
                <Item
                  value={home.assetDescription}
                  title={uda.details.split(DeepLinking.scheme)[0] || ''}
                />

                <View style={styles.gutter}>
                  {uda?.transactions.length > 0 && (
                    <AssetTransaction
                      hidePrecision
                      transaction={uda?.transactions[0]}
                      coin={uda?.name}
                      onPress={() => {
                        navigation.navigate(
                          NavigationRoutes.COINALLTRANSACTION,
                          {
                            assetId: assetId,
                            transactions: uda?.transactions,
                            name: uda?.name,
                            schema: RealmSchema.UniqueDigitalAsset,
                            hidePrecision: true,
                          },
                        );
                      }}
                      disabled={uda?.transactions.length === 1}
                      assetFace={uda?.assetIface}
                    />
                  )}
                </View>
                {hasIssuanceTransaction && !isCollectionUda && (
                  <>
                    <VerifyIssuer
                      assetId={assetId}
                      schema={RealmSchema.UniqueDigitalAsset}
                      onVerificationComplete={() => setRefreshToggle(t => !t)}
                      onRegisterComplete={() => setRefreshToggle(t => !t)}
                      showVerifyIssuer={showVerifyIssuer}
                      showDomainVerifyIssuer={showDomainVerifyIssuer}
                      asset={uda}
                      collectionId={
                        uda?.details.split(DeepLinking.scheme)[1]
                      }
                      onPressShare={() => {
                        if (!uda?.isIssuedPosted) {
                          setVisibleIssuedPostOnTwitter(true);
                        } else if (!uda?.isVerifyPosted && verified) {
                          setVisiblePostOnTwitter(true);
                        }
                      }}
                    />
                    {!uda?.issuer?.verified && (
                      <View style={styles.seperatorView} />
                    )}
                  </>
                )}
                <View style={[styles.wrapper, styles.viewRegistryCtaWrapper]}>
                  {isAddedInRegistry && (
                    <SelectOption
                      title={assets.viewInRegistry}
                      subTitle={''}
                      onPress={() =>
                        navigation.navigate(NavigationRoutes.WEBVIEWSCREEN, {
                          url: `${config.REGISTRY_URL}/${assetId}`,
                          title: 'Registry',
                        })
                      }
                      testID={'view_in_registry'}
                    />
                  )}
                  {hasIssuanceTransaction && (
                    <SelectOption
                      title={'Show your X post here'}
                      subTitle={''}
                      onPress={() =>
                        navigation.navigate(NavigationRoutes.IMPORTXPOST, {
                          assetId: assetId,
                          schema: RealmSchema.UniqueDigitalAsset,
                          asset: uda,
                        })
                      }
                      testID={'import_x_post'}
                    />
                  )}
                </View>
                {isAddedInRegistry && <View style={styles.seperatorView} />}
                {twitterPostVerificationWithLink?.link && (
                  <View style={styles.wrapper}>
                    <EmbeddedTweetView
                      tweetId={twitterPostVerificationWithLink?.link}
                    />
                  </View>
                )}
                <HideAssetView
                  title={assets.hideAsset}
                  onPress={() => hideAsset()}
                />
                <View style={{ height: screenHeight * 0.1 }} />
              </>
            )}
          </>
        )}

        <VerifyIssuerModal
          assetId={uda?.assetId}
          isVisible={showVerifyModal}
          onVerify={() => {
            setShowVerifyModal(false);
            setTimeout(() => {
              setVisiblePostOnTwitter(true);
            }, 1000);
          }}
          onDismiss={() => {
            setShowVerifyModal(false);
            setTimeout(() => setVisibleIssuedPostOnTwitter(true), 1000);
          }}
          onDomainVerify={() => {
            setShowVerifyModal(false);
            navigateWithDelay(() =>
              navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
                assetId: uda.assetId,
                schema: RealmSchema.UniqueDigitalAsset,
                savedDomainName: domainVerification?.name || '',
              }),
            );
          }}
          schema={RealmSchema.UniqueDigitalAsset}
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
              updateAssetPostStatus(
                uda,
                RealmSchema.UniqueDigitalAsset,
                assetId,
                false,
              );
              updateAssetIssuedPostStatus(
                RealmSchema.UniqueDigitalAsset,
                assetId,
                true,
              );
              setRefresh(prev => !prev);
            }}
            secondaryOnPress={() => {
              setVisiblePostOnTwitter(false);
              setCompleteVerification(false);
              updateAssetPostStatus(
                uda,
                RealmSchema.UniqueDigitalAsset,
                assetId,
                false,
              );
              updateAssetIssuedPostStatus(
                RealmSchema.UniqueDigitalAsset,
                assetId,
                true,
              );
            }}
            issuerInfo={uda}
          />
        </>
        <>
          <IssueAssetPostOnTwitterModal
            visible={visibleIssuedPostOnTwitter}
            primaryOnPress={() => {
              setVisibleIssuedPostOnTwitter(false);
              setRefresh(prev => !prev);
              updateAssetIssuedPostStatus(
                RealmSchema.UniqueDigitalAsset,
                assetId,
                false,
              );
            }}
            secondaryOnPress={() => {
              setVisibleIssuedPostOnTwitter(false);
              setHasIssuedAsset(false);
              setRefresh(prev => !prev);
              updateAssetIssuedPostStatus(
                RealmSchema.UniqueDigitalAsset,
                assetId,
                false,
              );
            }}
            issuerInfo={uda}
          />
        </>
      </ScrollView>
      </GestureHandlerRootView>
    </>
  );
};
const getStyles = (theme: AppTheme, insets) =>
  StyleSheet.create({
    imageStyle: {
      width: '100%',
      height: '100%',
    },
    headerStyle: {
      position: 'absolute',
      left: wp(16),
      right: wp(16),
      zIndex: 100,
    },
    dataContainer: {
      flex: 1,
      paddingTop: insets.top,
    },
    gutter: {
      paddingHorizontal: wp(16),
    },
    wrapper: {
      paddingHorizontal: wp(16),
      paddingVertical: wp(15),
    },
    seperatorView: {
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.borderColor,
      marginVertical: hp(10),
    },
    viewRegistryCtaWrapper: {
      marginTop: hp(10),
    },
    // Bottom Container
    bottomContainer: {
      position: 'absolute',
      bottom:
        insets.bottom +
        Platform.select({
          ios: hp(5),
          android: hp(10),
        }),
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingHorizontal: wp(20),
      zIndex: 1000,
    },
    roundCtaCtr: {
      backgroundColor: theme.colors.roundedCtaBg,
      borderRadius: 100,
      padding: wp(13),
    },

    bottomCenterCta: {
      flexDirection: 'row',
      backgroundColor: theme.colors.roundedCtaBg,
      borderRadius: wp(100),
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: wp(23),
      paddingHorizontal: wp(23),
    },

    // Item
    itemWrapper: {
      marginTop: hp(15),
      paddingHorizontal: hp(16),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
      marginBottom: hp(2),
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.separator,
      marginTop: hp(15),
    },
    loaderAbsoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
export default UDADetailsScreen;
