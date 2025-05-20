import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { hp } from 'src/constants/responsive';
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
import DownloadIcon from 'src/assets/images/downloadBtn.svg';
import DownloadIconLight from 'src/assets/images/downloadBtnLight.svg';
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

export const Item = ({ title, value }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.itemWrapper}>
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
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);

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

  useEffect(() => {
    if (!collectible.metaData) {
      mutate({ assetId, schema: RealmSchema.Collectible });
    }
  }, []);

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

  useEffect(() => {
    if (
      collectible?.issuer?.verified &&
      !twitterPostVerificationWithLink &&
      twitterPostVerification &&
      !twitterPostVerification?.link
    ) {
      ApiHandler.searchForAssetTweet(collectible, RealmSchema.Collectible);
    }
  }, []);

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
      !collectible?.issuer?.verifiedBy?.some(
        v =>
          v.type === IssuerVerificationMethod.TWITTER ||
          v.type === IssuerVerificationMethod.TWITTER_POST,
      ) &&
      collectible.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collectible.transactions, collectible.issuer?.verifiedBy, refreshToggle]);

  const showDomainVerifyIssuer = useMemo(() => {
    return (
      !collectible?.issuer?.verifiedBy?.some(
        v => v.type === IssuerVerificationMethod.DOMAIN,
      ) &&
      collectible.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collectible.transactions, collectible.issuer?.verifiedBy, refreshToggle]);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        enableBack={true}
        rightIcon={isThemeDark ? <DownloadIcon /> : <DownloadIconLight />}
        onSettingsPress={() => {
          const filePath = Platform.select({
            android: `file://${collectible.media?.filePath}`, // Ensure 'file://' prefix
            ios: `${collectible.media?.filePath}`, // Add file extension
          });
          onShare(filePath);
        }}
        style={styles.headerWrapper}
      />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <>
          <ScrollView
            style={styles.scrollingContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: Platform.select({
                    android: `file://${collectible.media?.filePath}`,
                    ios: collectible.media?.filePath,
                  }),
                }}
                resizeMode="cover"
                style={styles.imageStyle}
              />
            </View>
            <View style={styles.wrapper}>
              <IssuerVerified
                id={twitterVerification.id}
                name={twitterVerification.name}
                username={
                  collectible?.twitterHandle
                    ? collectible?.twitterHandle.replace(/@/g, '')
                    : twitterVerification.username
                }
              />
              <IssuerDomainVerified
                domain={
                  collectible?.domainName
                    ? collectible?.domainName
                    : collectible?.issuer?.verifiedBy?.find(
                        v => v.type === IssuerVerificationMethod.DOMAIN,
                      )?.name
                }
                verified={collectible?.issuer?.verified}
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
                app.appType === AppType.NODE_CONNECT
                  ? numberWithCommas(collectible.issuedSupply)
                  : collectible &&
                    collectible.metaData &&
                    numberWithCommas(collectible.metaData.issuedSupply)
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

            <>
              <VerifyIssuer
                assetId={assetId}
                schema={RealmSchema.Collectible}
                onVerificationComplete={() => setRefreshToggle(t => !t)}
                showVerifyIssuer={showVerifyIssuer}
                showDomainVerifyIssuer={showDomainVerifyIssuer}
                asset={collectible}
                onPressShare={() => {
                  if (!collectible?.isIssuedPosted) {
                    setVisibleIssuedPostOnTwitter(true);
                  } else if (!collectible?.isVerifyPosted) {
                    setVisiblePostOnTwitter(true);
                  }
                }}
              />
              <View style={styles.seperatorView} />
            </>
            <View style={[styles.wrapper, styles.viewRegistryCtaWrapper]}>
              {collectible?.issuer?.verified && (
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
            </View>
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
                    true,
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
                    true,
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
      paddingHorizontal: 20,
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
    },
    imageStyle: {
      width: '100%',
      height: hp(280),
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    imageWrapper: {
      paddingHorizontal: hp(16),
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
