import {
  Image,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject, useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import Share from 'react-native-share';
import moment from 'moment';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import {
  Collectible,
  TransferKind,
  AssetVisibility,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppText from 'src/components/AppText';
import ModalLoading from 'src/components/ModalLoading';
import { Keys } from 'src/storage';
import GradientView from 'src/components/GradientView';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import AssetIDContainer from './components/AssetIDContainer';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import HideAssetView from './components/HideAssetView';
import dbManager from 'src/storage/realm/dbManager';
import VerifyIssuer from './components/VerifyIssuer';
import IssuerVerified from './components/IssuerVerified';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import { AppContext } from 'src/contexts/AppContext';
import {
  updateAssetIssuedPostStatus,
  updateAssetPostStatus,
} from 'src/utils/postStatusUtils';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import SelectOption from 'src/components/SelectOption';
import openLink from 'src/utils/OpenLink';
import IssuerDomainVerified from './components/IssuerDomainVerified';
import EmbeddedTweetView from 'src/components/EmbeddedTweetView';
import Relay from 'src/services/relay';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import config from 'src/utils/config';
import DownloadIcon from 'src/assets/images/downloadIcon.svg';
import AppTouchable from 'src/components/AppTouchable';
import RegistryIconLight from 'src/assets/images/registryIcon_light.svg';
import RegistryIcon from 'src/assets/images/registryIcon.svg';
import ImageViewing from 'react-native-image-viewing';
import { CustomImage } from 'src/components/CustomImage';

type itemProps = {
  title: string;
  value: string;
  style?: StyleProp<ViewStyle>;
};

export const Item = ({ title, value, style }: itemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={[styles.itemWrapper, style]}>
      <AppText variant="body2" style={styles.labelText}>
        {title}
      </AppText>
      <GradientView
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}
        style={styles.assetNameWrapper}>
        <AppText variant="body2" style={styles.valueText}>
          {value}
        </AppText>
      </GradientView>
    </View>
  );
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

const CollectibleMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);
  const hasShownPostModal = useRef(false);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const {
    hasCompleteVerification,
    setCompleteVerification,
    setHasIssuedAsset,
  } = React.useContext(AppContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, home } = translations;
  const { assetId } = useRoute().params;
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isVerifyingIssuer, setIsVerifyingIssuer] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [isAddedInRegistry, setIsAddedInRegistry] = useState(false);
  const [imageSize, setImageSize] = useState(null);
  const [visible, setVisible] = useState(false);

  const twitterVerification = collectible?.issuer?.verifiedBy?.find(
    v =>
      v.type === IssuerVerificationMethod.TWITTER ||
      v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const twitterPostVerificationWithLink = collectible?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST && v.link,
  );
  const twitterPostVerification = collectible?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const domainVerification = collectible?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.DOMAIN,
  );

  const hasIssuanceTransaction = collectible?.transactions.some(
    transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
  );

  const verified = collectible?.issuer?.verifiedBy?.some(
    item => item.verified === true,
  );

  const url = domainVerification?.name?.startsWith('http')
    ? domainVerification?.name
    : `https://${domainVerification?.name}`;

  useEffect(() => {
    if (!collectible.metaData) {
      mutate({ assetId, schema: RealmSchema.Collectible });
    }
  }, []);

  useEffect(() => {
    const fetchAsset = async () => {
      const asset = await Relay.getAsset(assetId);
      setIsAddedInRegistry(asset.status);
    };
    fetchAsset();
  }, [assetId, refreshToggle]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        collectible?.issuer?.verified &&
        hasCompleteVerification &&
        !hasShownPostModal.current
      ) {
        hasShownPostModal.current = true;
        setTimeout(() => {
          setVisiblePostOnTwitter(true);
        }, 1000);
      }
    }, [collectible?.issuer?.verified, hasCompleteVerification]),
  );

  const hideAsset = () => {
    dbManager.updateObjectByPrimaryId(
      RealmSchema.Collectible,
      'assetId',
      assetId,
      {
        visibility: AssetVisibility.HIDDEN,
      },
    );
    navigation.dispatch(popAction);
  };

  const showVerifyIssuer = useMemo(() => {
    return (
      !twitterVerification?.id &&
      collectible.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collectible.transactions, collectible.issuer?.verifiedBy, refreshToggle]);

  const showDomainVerifyIssuer = useMemo(() => {
    return (
      !domainVerification?.verified &&
      collectible?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [
    collectible?.transactions,
    collectible?.issuer?.verifiedBy,
    refreshToggle,
  ]);

  useEffect(() => {
    Image.getSize(
      Platform.select({
        android: `file://${collectible.media?.filePath}`,
        ios: `${collectible.media?.filePath}`,
      }),
      (width, height) => {
        const ratio = height / width;
        const maxWidth = windowWidth - wp(30);
        const scaledHeight = maxWidth * ratio;
        setImageSize({ width: maxWidth, height: scaledHeight });
      },
      error => {
        console.error('Failed to get image size', error);
      },
    );
  }, [collectible?.media?.filePath]);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        enableBack={true}
        rightIcon={
          isAddedInRegistry &&
          (isThemeDark ? <RegistryIcon /> : <RegistryIconLight />)
        }
        onSettingsPress={() => {
          navigation.navigate(NavigationRoutes.WEBVIEWSCREEN, {
            url: `${config.REGISTRY_URL}/${assetId}`,
            title: 'Registry',
          });
        }}
        style={styles.headerWrapper}
      />
      {isLoading || isVerifyingIssuer ? (
        <ModalLoading visible={isLoading || isVerifyingIssuer} />
      ) : (
        <>
          <ScrollView
            style={styles.scrollingContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageWrapper}>
              <AppTouchable
                style={styles.downloadIconWrapper}
                onPress={() => {
                  const filePath = Platform.select({
                    android: `file://${collectible.media?.filePath}`,
                    ios: `${collectible.media?.filePath}`,
                  });
                  onShare(filePath);
                }}>
                <DownloadIcon />
              </AppTouchable>
              {imageSize && (
                <AppTouchable onPress={() => setVisible(true)}>
                  <CustomImage
                    uri={Platform.select({
                      android: `file://${collectible.media?.filePath}`,
                      ios: collectible.media?.filePath,
                    })}
                    imageStyle={[
                      styles.imageStyle,
                      {
                        width: imageSize.width,
                        height: Math.min(imageSize.height, windowHeight / 2),
                      },
                    ]}
                  />
                </AppTouchable>
              )}
            </View>
            <View style={styles.wrapper}>
              <IssuerVerified
                id={twitterVerification?.id}
                name={twitterVerification?.name}
                username={twitterVerification?.username.replace(/@/g, '')}
                assetId={assetId}
                schema={RealmSchema.Collectible}
                onVerificationComplete={() => setRefreshToggle(t => !t)}
                setIsVerifyingIssuer={setIsVerifyingIssuer}
                hasIssuanceTransaction={hasIssuanceTransaction}
              />
              <IssuerDomainVerified
                domain={
                  collectible?.issuer?.verifiedBy?.find(
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
                      schema: RealmSchema.Collectible,
                      savedDomainName: domainVerification?.name || '',
                    });
                  }
                }}
                hasIssuanceTransaction={hasIssuanceTransaction}
              />
            </View>
            <Item
              title={home.assetName}
              value={collectible && collectible.name}
            />
            <Item
              title={home.assetDescription}
              value={collectible && collectible.details}
            />
            <View style={styles.wrapper}>
              <AssetIDContainer assetId={assetId} />
            </View>
            <Item
              title={assets.issuedSupply}
              value={
                app.appType === AppType.NODE_CONNECT ||
                app.appType === AppType.SUPPORTED_RLN
                  ? numberWithCommas(
                      Number(collectible.issuedSupply) /
                        10 ** collectible.precision,
                    )
                  : collectible?.metaData &&
                    numberWithCommas(
                      Number(collectible?.issuedSupply) /
                        10 ** collectible?.precision,
                    )
              }
            />

            <Item
              title={assets.precision}
              value={collectible && collectible.precision}
            />

            <Item
              title={assets.issuedOn}
              value={moment
                .unix(collectible.metaData && collectible.metaData.timestamp)
                .format('DD MMM YY  hh:mm A')}
            />
                <VerifyIssuer
                  assetId={assetId}
                  schema={RealmSchema.Collectible}
                  onVerificationComplete={() => setRefreshToggle(t => !t)}
                  onRegisterComplete={() => setRefreshToggle(t => !t)}
                  showVerifyIssuer={showVerifyIssuer}
                  showDomainVerifyIssuer={showDomainVerifyIssuer}
                  asset={collectible}
                  onPressShare={() => {
                    if (!collectible?.isIssuedPosted) {
                      setVisibleIssuedPostOnTwitter(true);
                    } else if (!collectible?.isVerifyPosted && verified) {
                      setVisiblePostOnTwitter(true);
                    }
                  }}
                />
                {!collectible?.issuer?.verified && (
                  <View style={styles.seperatorView} />
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
                      schema: RealmSchema.Collectible,
                      asset: collectible,
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
            <>
              <PostOnTwitterModal
                visible={visiblePostOnTwitter}
                primaryOnPress={() => {
                  setVisiblePostOnTwitter(false);
                  setCompleteVerification(false);
                  updateAssetPostStatus(
                    collectible,
                    RealmSchema.Collectible,
                    assetId,
                    false,
                  );
                  updateAssetIssuedPostStatus(
                    RealmSchema.Collectible,
                    assetId,
                    true,
                  );
                  setRefresh(prev => !prev);
                }}
                secondaryOnPress={() => {
                  setVisiblePostOnTwitter(false);
                  setCompleteVerification(false);
                  updateAssetPostStatus(
                    collectible,
                    RealmSchema.Collectible,
                    assetId,
                    false,
                  );
                  updateAssetIssuedPostStatus(
                    RealmSchema.Collectible,
                    assetId,
                    true,
                  );
                }}
                issuerInfo={collectible}
              />
            </>
            <>
              <IssueAssetPostOnTwitterModal
                visible={visibleIssuedPostOnTwitter}
                primaryOnPress={() => {
                  setVisibleIssuedPostOnTwitter(false);
                  setRefresh(prev => !prev);
                  updateAssetIssuedPostStatus(
                    RealmSchema.Collectible,
                    assetId,
                    false,
                  );
                }}
                secondaryOnPress={() => {
                  setVisibleIssuedPostOnTwitter(false);
                  setHasIssuedAsset(false);
                  setRefresh(prev => !prev);
                  updateAssetIssuedPostStatus(
                    RealmSchema.Collectible,
                    assetId,
                    false,
                  );
                }}
                issuerInfo={collectible}
              />
            </>
          </ScrollView>
        </>
      )}
      <ImageViewing
        images={[
          {
            uri: Platform.select({
              android: `file://${collectible.media?.filePath}`,
              ios: collectible.media?.filePath,
            }),
          },
        ]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: hp(0),
    },
    headerWrapper: {
      paddingHorizontal: hp(16),
    },
    itemWrapper: {
      marginVertical: hp(10),
      paddingHorizontal: hp(16),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    assetNameWrapper: {
      minHeight: hp(50),
      padding: hp(10),
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    detailText: {
      marginBottom: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      paddingHorizontal: hp(5),
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    imageWrapper: {
      paddingHorizontal: hp(16),
    },
    downloadIconWrapper: {
      position: 'absolute',
      zIndex: 999,
      right: 30,
      top: 10,
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

export default CollectibleMetaDataScreen;
