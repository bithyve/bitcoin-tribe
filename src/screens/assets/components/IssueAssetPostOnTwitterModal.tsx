import {
  Image,
  ImageBackground,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ModalContainer from 'src/components/ModalContainer';
import Buttons from 'src/components/Buttons';
import AppText from 'src/components/AppText';
import { AssetFace, Issuer } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import AssetIcon from 'src/components/AssetIcon';
import PostIssuerVerified from './PostIssuerVerified';
import Colors from 'src/theme/Colors';
import { AppContext } from 'src/contexts/AppContext';
import Toast from 'src/components/Toast';

interface Props {
  visible: boolean;
  primaryOnPress?: () => void;
  secondaryOnPress: () => void;
  issuerInfo: Issuer;
}

const IssueAssetPostOnTwitterModal: React.FC<Props> = ({
  visible,
  secondaryOnPress,
  issuerInfo,
}) => {
  const scaleFactor = PixelRatio.get();
  const cardWidth = 1200 / scaleFactor;
  const cardHeight = 675 / scaleFactor;
  const { translations } = useContext(LocalizationContext);
  const { setCompleteVerification } = React.useContext(AppContext);
  const { common, assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, cardWidth, cardHeight),
    [theme, cardWidth, cardHeight],
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const navigation = useNavigation();
  const viewShotRef = useRef<ViewShot | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (uri) setImageUri(uri);
      }
    };

    loadImage();
  }, []);

  useEffect(() => {
    if (visible) {
      showPreview();
    }
  }, [visible]);

  const showPreview = async () => {
    try {
      if (!viewShotRef.current) return;

      const uri = await viewShotRef.current.capture({ result: 'tmpfile' });
      if (uri) {
        setCapturedImage(uri);
      }
    } catch (error) {
      console.error('Error capturing ViewShot:', error);
    }
  };

  const captureAndShare = async () => {
    try {
      if (!viewShotRef.current) return;
      let uri = imageUri;
      if (!uri) {
        uri = await viewShotRef.current.capture({ result: 'tmpfile' });
        if (!uri) {
          console.error('Failed to capture image');
          return;
        }
        setImageUri(uri);
      }
      const randomNumber = Math.floor(Math.random() * 100000);
      const filePath =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}/tweet_image_${randomNumber}.jpg`
          : `${RNFS.ExternalCachesDirectoryPath}/tweet_image_${randomNumber}.jpg`;

      await RNFS.copyFile(uri, filePath);
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        console.error('File was not saved properly:', filePath);
        return;
      }
      const tweetText = `I’ve officially issued "${
        issuerInfo.name || 'this asset'
      }" on @bitcointribe_.
        
        Transparency matters.
        Trust, but verify — start here 👇`;

      const shareOptions =
        Platform.OS === 'android'
          ? {
              title: 'Share via',
              message: tweetText,
              url: `file://${filePath}`,
              social: Share.Social.TWITTER,
            }
          : {
              title: 'Share via',
              message: tweetText,
              url: `file://${filePath}`,
            };
      const isTwitterAvailable = await Share.isPackageInstalled(
        'com.twitter.android',
      );
      if (!isTwitterAvailable) {
        Toast('X not installed. Please install X to share.');
        return;
      }

      await Share.shareSingle(shareOptions);
      secondaryOnPress();
      setCompleteVerification(false);
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
    }
  };

  return (
    <ModalContainer
      title={assets.assetCreateMsg}
      subTitle={assets.issuedSuccessSubTitle}
      visible={visible}
      enableCloseIcon={false}
      onDismiss={() => setCompleteVerification(false)}>
      <View style={styles.modalContent}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 1.0, width: 1200, height: 675 }}
          style={styles.container}>
          <ImageBackground
            source={require('src/assets/images/TwitterTemplate.png')}
            resizeMode="cover"
            style={styles.card}>
            <View style={styles.wrapper}>
              <AppText variant="heading1" style={styles.headingText}>
                {assets.issuedPostTitle}
              </AppText>
              <Text style={styles.text}>
                <Text style={[styles.text, styles.userNameStyle]}>
                  {issuerInfo.name}{' '}
                </Text>
                {assets.issuedPostSubTitle}
              </Text>
              <View>
                <View style={styles.qrContainer}>
                  <QRCode value="https://bitcointribe.com" size={226} />
                </View>
                <AppText variant="body1" style={styles.scanText}>
                  Scan Me!
                </AppText>
              </View>
            </View>
            <View style={styles.wrapper1}>
              <ImageBackground
                source={require('src/assets/images/twitterTemplateAssetbackground.png')}
                resizeMode="cover"
                style={styles.assetCardWrapper}>
                <View style={styles.assetImageWrapper}>
                  {issuerInfo.assetIface &&
                  issuerInfo.assetIface.toUpperCase() === AssetFace.RGB25 ? (
                    <Image
                      source={{
                        uri: Platform.select({
                          android: `file://${
                            issuerInfo.media && issuerInfo?.media?.filePath
                          }`,
                          ios: issuerInfo.media && issuerInfo?.media?.filePath,
                        }),
                      }}
                      resizeMode="cover"
                      style={styles.imageStyle}
                    />
                  ) : issuerInfo.assetIface.toUpperCase() ===
                    AssetFace.RGB21 ? (
                    <Image
                      source={{
                        uri: Platform.select({
                          android: `file://${
                            issuerInfo.token &&
                            issuerInfo?.token.media?.filePath
                          }`,
                          ios:
                            issuerInfo.token &&
                            issuerInfo?.token.media?.filePath,
                        }),
                      }}
                      resizeMode="cover"
                      style={styles.imageStyle}
                    />
                  ) : (
                    <View style={styles.identiconWrapper}>
                      <AssetIcon
                        assetTicker={issuerInfo.ticker && issuerInfo?.ticker}
                        assetID={issuerInfo.assetId && issuerInfo?.assetId}
                        size={250}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.verifiedViewWrapper}>
                  <View>
                    <AppText
                      variant="heading3"
                      style={
                        issuerInfo.ticker
                          ? styles.assetTitleText
                          : styles.assetTitleText1
                      }>
                      {issuerInfo.name}
                    </AppText>
                    {issuerInfo.ticker && (
                      <AppText variant="body1" style={styles.assetTickerText}>
                        {issuerInfo.ticker}
                      </AppText>
                    )}
                    {issuerInfo.assetId && (
                      <AppText variant="body1" style={styles.assetTickerText}>
                        Asset ID: {issuerInfo.assetId}
                      </AppText>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </View>
          </ImageBackground>
        </ViewShot>

        <Image
          source={{ uri: capturedImage }}
          style={styles.previewImageStyle}
          resizeMode="contain"
        />
      </View>
      <View>
        <Buttons
          primaryTitle={common.share}
          primaryOnPress={captureAndShare}
          secondaryTitle={common.cancel}
          secondaryOnPress={secondaryOnPress}
          width={windowWidth / 2.7}
          secondaryCTAWidth={windowWidth / 2.7}
        />
      </View>
    </ModalContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: -9999,
      left: -9999,
    },
    modalContent: {
      height: hp(220),
      marginBottom: hp(15),
    },
    card: {
      width: 1200,
      height: 685,
      backgroundColor: '#1E1E1E',
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: hp(5),
      paddingHorizontal: hp(55),
    },
    headingText: {
      fontWeight: 'bold',
      fontSize: hp(70),
      color: Colors.White,
      marginBottom: hp(3),
    },
    text: {
      color: Colors.White,
      fontSize: hp(26),
    },
    userNameStyle: {
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 15,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    assetImageWrapper: {
      width: '100%',
      height: '60%',
      marginBottom: hp(10),
    },
    identiconWrapper: {
      zIndex: 999,
      alignSelf: 'center',
      marginTop: hp(30),
      width: hp(250),
      height: hp(250),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      backgroundColor: Colors.White,
      borderRadius: hp(200),
    },
    wrapper: {
      width: '58%',
      alignItems: 'flex-start',
    },
    wrapper1: {
      width: '42%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    assetCardWrapper: {
      height: hp(450),
      width: wp(337),
      borderRadius: 30,
      margin: hp(6),
    },
    qrContainer: {
      marginTop: hp(35),
      alignItems: 'center',
      backgroundColor: 'white',
      padding: hp(5),
    },
    scanText: {
      color: Colors.White,
      marginTop: hp(10),
      textAlign: 'center',
      fontSize: hp(28),
    },
    verifiedViewWrapper: {},
    assetTitleText: {
      textAlign: 'center',
      color: Colors.White,
      marginBottom: hp(10),
      marginTop: hp(20),
      fontWeight: 'bold',
    },
    assetTitleText1: {
      textAlign: 'center',
      color: Colors.White,
      marginVertical: hp(25),
      fontWeight: 'bold',
    },
    assetTickerText: {
      textAlign: 'center',
      color: Colors.White,
      marginBottom: hp(20),
      fontWeight: 'bold',
    },
    previewImageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
  });
export default IssueAssetPostOnTwitterModal;
