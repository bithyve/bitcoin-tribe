import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
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

const UDADetailsScreen = () => {
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);
  const hasShownPostModal = useRef(false);
  const { assetId, askReview, askVerify } = useRoute().params;
  const styles = getStyles();
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
  const theme: AppTheme = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [openTwitterAfterVerifyClose, setOpenTwitterAfterVerifyClose] =
    useState(false);

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
    if (askReview) {
      setTimeout(() => {
        requestAppReview();
        if (askVerify) {
          setShowVerifyModal(true);
        }
      }, 2000);
    }
  }, [askReview, askVerify]);

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
      !uda?.issuer?.verified &&
      uda?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [uda?.transactions, uda?.issuer]);

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
    <ScreenContainer>
      <AppHeader title={uda?.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri: Platform.select({
              android: `file://${uda?.token.media?.filePath}`,
              ios: uda?.token.media?.filePath,
            }),
          }}
          resizeMode="contain"
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

        {uda?.issuer && uda?.issuer?.verified && (
          <IssuerVerified
            id={uda?.issuer?.verifiedBy[0]?.id}
            name={uda?.issuer?.verifiedBy[0]?.name}
            username={uda?.issuer?.verifiedBy[0]?.username}
          />
        )}

        <Item title={home.assetName} value={uda.name} />
        <AssetIDContainer assetId={assetId} />
        <Item title={home.assetTicker} value={uda.ticker} />
        <Item title={home.assetDescription} value={uda.details} />
        <MediaCarousel
          images={uda?.token.attachments}
          handleImageSelect={item => {
            setVisible(true);
            setSelectedImage(item?.filePath);
          }}
        />
        <Item
          title={assets.issuedOn}
          value={moment.unix(uda?.timestamp).format('DD MMM YY  hh:mm A')}
        />
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

        {showVerifyIssuer && (
          <VerifyIssuer
            assetId={assetId}
            schema={RealmSchema.UniqueDigitalAsset}
          />
        )}
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
        <HideAssetView
          title={assets.hideAsset}
          onPress={() => hideAsset()}
          isVerified={uda?.issuer?.verified}
          assetId={assetId}
        />
      </ScrollView>
      <VerifyIssuerModal
        assetId={uda?.assetId}
        isVisible={showVerifyModal}
        onVerify={() => {
          setShowVerifyModal(false);
          setTimeout(() => {
            setVisiblePostOnTwitter(true);
          }, 500);
        }}
        onDismiss={() => {
          setShowVerifyModal(false);
          setTimeout(() => {
            setVisibleIssuedPostOnTwitter(true);
          }, 500);
        }}
        schema={RealmSchema.UniqueDigitalAsset}
      />
      <>
        <PostOnTwitterModal
          visible={visiblePostOnTwitter}
          secondaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
          }}
          issuerInfo={uda}
        />
      </>
      <>
        <IssueAssetPostOnTwitterModal
          visible={visibleIssuedPostOnTwitter}
          secondaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            setHasIssuedAsset(false);
          }}
          issuerInfo={uda}
        />
      </>
    </ScreenContainer>
  );
};
const getStyles = () =>
  StyleSheet.create({
    imageStyle: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    buttonWrapper: {
      marginHorizontal: wp(5),
      paddingBottom: 0,
      marginVertical: wp(5),
      alignItems: 'center',
    },
  });
export default UDADetailsScreen;
