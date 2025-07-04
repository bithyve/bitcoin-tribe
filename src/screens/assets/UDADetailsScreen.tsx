import {
  AppState,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import ImageViewing from 'react-native-image-viewing';

import ScreenContainer from 'src/components/ScreenContainer';
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
import { Item } from './CollectibleMetaDataScreen';
import IconSend from 'src/assets/images/icon_send.svg';
import IconSendLight from 'src/assets/images/icon_send_light.svg';
import RoundedCTA from 'src/components/RoundedCTA';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import HideAssetView from './components/HideAssetView';
import dbManager from 'src/storage/realm/dbManager';
import MediaCarousel from './components/MediaCarousel';
import AssetTransaction from '../wallet/components/AssetTransaction';
import AssetIDContainer from './components/AssetIDContainer';
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

const UDADetailsScreen = () => {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);
  const hasShownPostModal = useRef(false);
  const appState = useRef(AppState.currentState);
  const { assetId, askReview, askVerify } = useRoute().params;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const {
    appType,
    hasCompleteVerification,
    setCompleteVerification,
    hasIssuedAsset,
    setHasIssuedAsset,
  } = useContext(AppContext);
  const uda = useObject<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    assetId,
  ).toJSON();

  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, common, home } = translations;
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
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

  const twitterVerification = uda?.issuer?.verifiedBy?.find(
    v =>
      v.type === IssuerVerificationMethod.TWITTER ||
      v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const twitterPostVerificationWithLink = uda?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST && v.link,
  );
  const twitterPostVerification = uda?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST,
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
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.UniqueDigitalAsset });
      if (appType === AppType.NODE_CONNECT) {
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

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title={uda?.name} style={styles.wrapper} />
      {isVerifyingIssuer ? (
        <ModalLoading visible={isVerifyingIssuer} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={{
              uri: Platform.select({
                android: `file://${uda?.token.media?.filePath}`,
                ios: uda?.token.media?.filePath,
              }),
            }}
            resizeMode="cover"
            style={styles.imageStyle}
          />

          {uda?.balance.spendable > 0 && (
            <View style={styles.buttonWrapper}>
              <RoundedCTA
                colors={[
                  theme.colors.inputBackground,
                  theme.colors.inputBackground,
                  theme.colors.inputBackground,
                ]}
                textColor={theme.colors.roundSendCTATitle}
                icon={isThemeDark ? <IconSend /> : <IconSendLight />}
                buttonColor={theme.colors.sendCtaBorderColor}
                title={common.send}
                onPress={() =>
                  navigation.navigate(NavigationRoutes.SCANASSET, {
                    assetId: assetId,
                    rgbInvoice: '',
                    isUDA: true,
                  })
                }
                width={wp(105)}
              />
            </View>
          )}
          <Item
            title={assets.issuedOn}
            value={moment.unix(uda?.timestamp).format('DD MMM YY  hh:mm A')}
          />
          <View style={styles.wrapper}>
            {uda?.transactions.length > 0 && (
              <AssetTransaction
                transaction={uda?.transactions[0]}
                coin={uda?.name}
                onPress={() => {
                  navigation.navigate(NavigationRoutes.COINALLTRANSACTION, {
                    assetId: assetId,
                    transactions: uda?.transactions,
                    assetName: uda?.name,
                  });
                }}
                disabled={uda?.transactions.length === 1}
                assetFace={uda?.assetSchema.toUpperCase()}
              />
            )}
          </View>
          <View style={styles.wrapper}>
            <IssuerVerified
              id={twitterVerification?.id}
              name={twitterVerification?.name}
              username={twitterVerification?.username.replace(/@/g, '')}
              assetId={assetId}
              schema={RealmSchema.UniqueDigitalAsset}
              onVerificationComplete={() => setRefreshToggle(t => !t)}
              setIsVerifyingIssuer={setIsVerifyingIssuer}
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
            />
          </View>
          <Item title={home.assetName} value={uda.name} />
          <View style={styles.wrapper}>
            <AssetIDContainer assetId={assetId} />
          </View>
          <Item title={home.assetTicker} value={uda.ticker} />
          <Item title={home.assetDescription} value={uda.details} />
          <View style={styles.wrapper}>
            <MediaCarousel
              images={uda?.token.attachments}
              handleImageSelect={item => {
                setVisible(true);
                setSelectedImage(item?.filePath);
              }}
            />
          </View>
          <Item
            title={assets.issuedOn}
            value={moment.unix(uda?.timestamp).format('DD MMM YY  hh:mm A')}
          />
          <View style={styles.wrapper}>
            {uda?.transactions.length > 0 && (
              <AssetTransaction
                transaction={uda?.transactions[0]}
                coin={uda?.name}
                onPress={() => {
                  navigation.navigate(NavigationRoutes.COINALLTRANSACTION, {
                    assetId: assetId,
                    transactions: uda?.transactions,
                    assetName: uda?.name,
                  });
                }}
                disabled={uda?.transactions.length === 1}
                assetFace={uda?.assetIface}
              />
            )}
          </View>
          {hasIssuanceTransaction && (
            <>
              <VerifyIssuer
                assetId={assetId}
                schema={RealmSchema.UniqueDigitalAsset}
                onVerificationComplete={() => setRefreshToggle(t => !t)}
                onRegisterComplete={() => setRefreshToggle(t => !t)}
                showVerifyIssuer={showVerifyIssuer}
                showDomainVerifyIssuer={showDomainVerifyIssuer}
                asset={uda}
                onPressShare={() => {
                  if (!uda?.isIssuedPosted) {
                    setVisibleIssuedPostOnTwitter(true);
                  } else if (!uda?.isVerifyPosted && verified) {
                    setVisiblePostOnTwitter(true);
                  }
                }}
              />
              {!uda?.issuer?.verified && <View style={styles.seperatorView} />}
            </>
          )}
          <View style={[styles.wrapper, styles.viewRegistryCtaWrapper]}>
            {isAddedInRegistry && (
              <SelectOption
                title={assets.viewInRegistry}
                subTitle={''}
                onPress={() =>
                  openLink(
                    `https://bitcointribe.app/registry?assetId=${assetId}`,
                  )
                }
                testID={'view_in_registry'}
              />
            )}
            {hasIssuanceTransaction &&
              twitterVerification?.id &&
              !twitterPostVerificationWithLink &&
              !twitterPostVerification?.link && (
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
          <>
            <ImageViewing
              images={[
                {
                  uri: Platform.select({
                    android: `file://${selectedImage}`,
                    ios: selectedImage,
                  }),
                },
              ]}
              imageIndex={0}
              visible={visible}
              onRequestClose={() => setVisible(false)}
            />
          </>
          {twitterPostVerificationWithLink?.link && (
            <View style={styles.wrapper}>
              <EmbeddedTweetView
                tweetId={twitterPostVerificationWithLink?.link}
              />
            </View>
          )}
          <HideAssetView title={assets.hideAsset} onPress={() => hideAsset()} />
        </ScrollView>
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
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    imageStyle: {
      width: '90%',
      height: hp(280),
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
      marginHorizontal: hp(16),
    },
    buttonWrapper: {
      marginHorizontal: wp(5),
      paddingBottom: 0,
      marginVertical: wp(5),
      alignItems: 'center',
    },
    container1: {
      paddingHorizontal: hp(0),
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: hp(0),
    },
    wrapper: {
      paddingHorizontal: hp(16),
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
  });
export default UDADetailsScreen;
