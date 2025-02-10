import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import ImageViewing from 'react-native-image-viewing';
import ScreenContainer from 'src/components/ScreenContainer';
import { TransferKind, UniqueDigitalAsset } from 'src/models/interfaces/RGBWallet';
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
import MediaCarousel from './components/MediaCarousel';
import AssetTransaction from '../wallet/components/AssetTransaction';
import AssetIDContainer from './components/AssetIDContainer';
import VerifyIssuer from './components/VerifyIssuer';
import IssuerVerified from './components/IssuerVerified';

const UDADetailsScreen = () => {
  const navigation = useNavigation();
  const { assetId } = useRoute().params;
  const styles = getStyles();
  const { appType } = useContext(AppContext);
  const uda = useObject<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    assetId,
  );

  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, common, home } = translations;
  const theme: AppTheme = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const showVerifyIssuer = useMemo(() => {
    return !uda?.issuer?.verified && uda.transactions.some(transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE);
  }, [uda.transactions, uda.issuer]);

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

  return (
    <ScreenContainer>
      <AppHeader title={uda.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri: Platform.select({
              android: `file://${uda.token.media?.filePath}`,
              ios: uda.token.media?.filePath,
            }),
          }}
          resizeMode="contain"
          style={styles.imageStyle}
        />

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
              })
            }
            width={wp(105)}
          />
        </View>

        {
          uda?.issuer && uda.issuer.verified && (
            <IssuerVerified
              id={uda.issuer.verifiedBy[0].id}
              name={uda.issuer.verifiedBy[0].name}
              username={uda.issuer.verifiedBy[0].username}
            />
          )
        }

        <Item title={home.assetName} value={uda.name} />
        <AssetIDContainer assetId={assetId} />
        <Item title={home.assetTicker} value={uda.ticker} />
        <Item title={home.assetDescription} value={uda.details} />
        <MediaCarousel
          images={uda.token.attachments}
          handleImageSelect={item => {
            setVisible(true);
            setSelectedImage(item?.filePath);
          }}
        />
        <Item
          title={assets.issuedOn}
          value={moment.unix(uda.timestamp).format('DD MMM YY  hh:mm A')}
        />
        {uda?.transactions.length > 0 && (
          <AssetTransaction
            transaction={uda?.transactions[0]}
            coin={uda.name}
            onPress={() => {
              navigation.navigate(NavigationRoutes.COINALLTRANSACTION, {
                assetId: assetId,
                transactions: uda?.transactions,
                assetName: uda.name,
              });
            }}
            disabled={uda?.transactions.length === 1}
            assetFace={uda.assetIface}
          />
        )}

        {showVerifyIssuer &&
          <VerifyIssuer
            assetId={assetId}
            schema={RealmSchema.UniqueDigitalAsset} />
        }
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
      </ScrollView>
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
