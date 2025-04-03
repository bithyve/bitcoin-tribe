import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject, useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import Share from 'react-native-share';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import {
  Collectible,
  TransferKind,
  AssetVisibility,
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
import moment from 'moment';
import HideAssetView from './components/HideAssetView';
import dbManager from 'src/storage/realm/dbManager';
import VerifyIssuer from './components/VerifyIssuer';
import IssuerVerified from './components/IssuerVerified';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import { AppContext } from 'src/contexts/AppContext';

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
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { hasCompleteVerification } = React.useContext(AppContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, home } = translations;
  const { assetId } = useRoute().params;
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);

  useEffect(() => {
    if (!collectible.metaData) {
      mutate({ assetId, schema: RealmSchema.Collectible });
    }
  }, []);

  useEffect(() => {
    if (collectible.issuer?.verified && hasCompleteVerification) {
      setTimeout(() => {
        setVisiblePostOnTwitter(true);
      }, 500);
    }
  }, [collectible?.issuer?.verified, hasCompleteVerification]);

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
      !collectible?.issuer?.verified &&
      collectible.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collectible.transactions, collectible.issuer]);

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
            {collectible?.issuer && collectible.issuer.verified && (
              <IssuerVerified
                id={collectible.issuer.verifiedBy[0].id}
                name={collectible.issuer.verifiedBy[0].name}
                username={collectible.issuer.verifiedBy[0].username}
              />
            )}
            <Item
              title={home.assetName}
              value={collectible && collectible.name}
            />
            <Item
              title={home.assetDescription}
              value={collectible && collectible.details}
            />
            <AssetIDContainer assetId={assetId} />
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

            {showVerifyIssuer && (
              <VerifyIssuer
                assetId={assetId}
                schema={RealmSchema.Collectible}
              />
            )}
            <HideAssetView
              title={assets.hideAsset}
              onPress={() => hideAsset()}
              isVerified={collectible?.issuer?.verified}
              assetId={assetId}
            />
            <>
              <PostOnTwitterModal
                visible={visiblePostOnTwitter}
                secondaryOnPress={() => setVisiblePostOnTwitter(false)}
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
      paddingHorizontal: 0,
    },
    headerWrapper: {
      paddingHorizontal: 20,
    },
    itemWrapper: {
      marginVertical: hp(10),
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
      paddingHorizontal: hp(10),
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
      paddingHorizontal: hp(16),
    },
    imageStyle: {
      width: '100%',
      height: hp(280),
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    imageWrapper: {
      // borderBottomColor: theme.colors.borderColor,
      // borderBottomWidth: 1,
    },
  });

export default CollectibleMetaDataScreen;
