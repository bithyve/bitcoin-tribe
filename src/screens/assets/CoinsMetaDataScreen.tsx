import { AppState, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { MMKV, useMMKVBoolean } from 'react-native-mmkv';
import moment from 'moment';

import {
  Coin,
  TransferKind,
  AssetVisibility,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ModalLoading from 'src/components/ModalLoading';
import GradientView from 'src/components/GradientView';
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
import { Keys } from 'src/storage';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import SelectOption from 'src/components/SelectOption';
import openLink from 'src/utils/OpenLink';
import IssuerDomainVerified from './components/IssuerDomainVerified';
import EmbeddedTweetView from 'src/components/EmbeddedTweetView';

export const Item = ({ title, value, width = '100%' }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, width), [theme, width]);
  return (
    <View style={styles.contentWrapper}>
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

const CoinsMetaDataScreen = () => {
  const storage = new MMKV();
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);
  const appState = useRef(AppState.currentState);

  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const hasShownPostModal = useRef(false);
  const {
    hasCompleteVerification,
    setCompleteVerification,
    setHasIssuedAsset,
  } = React.useContext(AppContext);
  const { assets, home } = translations;
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);

  const twitterVerification = coin?.issuer?.verifiedBy?.find(
    v =>
      v.type === IssuerVerificationMethod.TWITTER ||
      v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const twitterPostVerificationWithLink = coin?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST && v.link,
  );
  const twitterPostVerification = coin?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  useEffect(() => {
    if (!coin.metaData) {
      mutate({ assetId, schema: RealmSchema.Coin });
    }
  }, []);

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
    if (
      coin?.issuer?.verified &&
      !twitterPostVerificationWithLink &&
      twitterPostVerification &&
      !twitterPostVerification?.link
    ) {
      ApiHandler.searchForAssetTweet(coin, RealmSchema.Coin);
    }
  }, []);

  const hideAsset = () => {
    dbManager.updateObjectByPrimaryId(RealmSchema.Coin, 'assetId', assetId, {
      visibility: AssetVisibility.HIDDEN,
    });
    navigation.dispatch(popAction);
  };

  const showVerifyIssuer = useMemo(() => {
    return (
      !coin?.issuer?.verifiedBy?.some(
        v =>
          v.type === IssuerVerificationMethod.TWITTER ||
          v.type === IssuerVerificationMethod.TWITTER_POST,
      ) &&
      coin.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [coin.transactions, coin.issuer?.verifiedBy, refreshToggle]);

  const showDomainVerifyIssuer = useMemo(() => {
    return (
      !coin?.issuer?.verifiedBy?.some(
        v => v.type === IssuerVerificationMethod.DOMAIN,
      ) &&
      coin.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [coin.transactions, coin.issuer?.verifiedBy, refreshToggle]);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        subTitle={''}
        enableBack={true}
        style={styles.wrapper}
      />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            {twitterVerification && (
              <IssuerVerified
                id={twitterVerification.id}
                name={twitterVerification.name}
                username={twitterVerification.username}
              />
            )}

            {coin?.issuer?.verifiedBy?.find(
              v => v.type === IssuerVerificationMethod.DOMAIN,
            ) && (
              <IssuerDomainVerified
                domain={
                  coin?.issuer?.verifiedBy?.find(
                    v => v.type === IssuerVerificationMethod.DOMAIN,
                  )?.name
                }
              />
            )}
          </View>
          <View style={styles.rowWrapper}>
            <Item title={home.assetName} value={coin.name} width={'45%'} />
            <Item
              title={home.assetTicker}
              value={coin.metaData && coin.metaData.ticker}
              width={'45%'}
            />
          </View>
          <View style={styles.wrapper}>
            <AssetIDContainer assetId={assetId} />
          </View>
          <View style={styles.rowWrapper}>
            <Item
              title={assets.schema}
              value={coin.metaData && coin.metaData.assetSchema.toUpperCase()}
              width={'45%'}
            />
            <Item
              title={assets.iFace}
              value={coin.metaData && coin.metaData.assetIface.toUpperCase()}
              width={'45%'}
            />
          </View>
          <View style={styles.rowWrapper}>
            <Item
              title={assets.issuedSupply}
              value={
                coin.metaData && numberWithCommas(coin.metaData.issuedSupply)
              }
              width={'45%'}
            />
            <Item
              title={assets.precision}
              value={coin.metaData && coin.metaData.precision}
              width={'45%'}
            />
          </View>
          <View style={styles.wrapper}>
            <Item
              title={assets.issuedOn}
              value={moment
                .unix(coin.metaData && coin.metaData.timestamp)
                .format('DD MMM YY  hh:mm A')}
            />
          </View>
          <>
            <VerifyIssuer
              assetId={assetId}
              schema={RealmSchema.Coin}
              onVerificationComplete={() => setRefreshToggle(t => !t)}
              asset={coin}
              showVerifyIssuer={showVerifyIssuer}
              showDomainVerifyIssuer={showDomainVerifyIssuer}
              onPressShare={() => {
                if (!coin.isIssuedPosted) {
                  setVisibleIssuedPostOnTwitter(true);
                } else if (!coin.isVerifyPosted) {
                  setVisiblePostOnTwitter(true);
                }
              }}
            />
            {!coin?.issuer?.verified && <View style={styles.seperatorView} />}
          </>
          <View style={[styles.wrapper, styles.viewRegistryCtaWrapper]}>
            {coin?.issuer?.verified && (
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
          {coin?.issuer?.verified && <View style={styles.seperatorView} />}
          {twitterPostVerificationWithLink?.link && (
            <View style={styles.wrapper}>
              <EmbeddedTweetView
                tweetId={twitterPostVerificationWithLink?.link}
              />
            </View>
          )}
          <HideAssetView title={assets.hideAsset} onPress={() => hideAsset()} />
          <>
            <PostOnTwitterModal
              visible={visiblePostOnTwitter}
              primaryOnPress={() => {
                setVisiblePostOnTwitter(false);
                setCompleteVerification(false);
                updateAssetPostStatus(coin, RealmSchema.Coin, assetId, true);
                updateAssetIssuedPostStatus(RealmSchema.Coin, assetId, true);
                setRefresh(prev => !prev);
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
                updateAssetIssuedPostStatus(
                  coin,
                  RealmSchema.Coin,
                  assetId,
                  true,
                );
              }}
              secondaryOnPress={() => {
                setVisibleIssuedPostOnTwitter(false);
                setHasIssuedAsset(false);
                setRefresh(prev => !prev);
                updateAssetIssuedPostStatus(
                  coin,
                  RealmSchema.Coin,
                  assetId,
                  false,
                );
              }}
              issuerInfo={coin}
            />
          </>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: hp(0),
    },
    assetNameWrapper: {
      justifyContent: 'center',
      paddingLeft: 10,
      minHeight: hp(50),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetValueText: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      marginVertical: hp(10),
      width: width,
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      borderRadius: 20,
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    rowWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
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
    viewRegistryCtaWrapper: {},
  });

export default CoinsMetaDataScreen;
