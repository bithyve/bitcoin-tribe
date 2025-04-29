import {
  Image,
  ImageBackground,
  Linking,
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
import Buttons from 'src/components/Buttons';
import AppText from 'src/components/AppText';
import { AssetFace, Issuer } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import AssetIcon from 'src/components/AssetIcon';
import PostIssuerVerified from './PostIssuerVerified';
import Colors from 'src/theme/Colors';
import { AppContext } from 'src/contexts/AppContext';
import Toast from 'src/components/Toast';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';

interface Props {
  visible: boolean;
  primaryOnPress?: () => void;
  secondaryOnPress: () => void;
  issuerInfo: Issuer;
}

const PostOnTwitterModal: React.FC<Props> = ({
  visible,
  secondaryOnPress,
  primaryOnPress,
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
        const uri = await viewShotRef.current.capture({ result: 'tmpfile' });
        if (uri) setImageUri(uri);
      }
    };

    loadImage();
  }, []);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        showPreview();
      }, 1000);
    }
  }, [visible]);

  const showPreview = async () => {
    try {
      if (!viewShotRef.current) return;

      const uri = await viewShotRef.current.capture({
        result: 'tmpfile',
        format: 'png',
      });
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
        uri = await viewShotRef.current.capture({
          result: 'tmpfile',
          format: 'png',
        });
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
          : `${RNFS.TemporaryDirectoryPath}/tweet_image_${randomNumber}.jpg`;

      await RNFS.copyFile(uri, filePath);
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        console.error('File was not saved properly:', filePath);
        return;
      }
      const tweetText = `I’ve officially verified my identity as the issuer of "${
        issuerInfo.name || 'this asset'
      }".
      
  Transparency matters.
  Trust, but verify — start here 👇`;
      const registryUrl = `\n\n\nhttps://bitcointribe.app/registry?assetId=${issuerInfo.assetId}`;
      const twitterAppURL = `twitter://post?message=${encodeURIComponent(
        tweetText + registryUrl,
      )}`;
      const twitterWebURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText + registryUrl,
      )}`;

      const canOpenTwitterApp = await Linking.canOpenURL(twitterAppURL);

      if (canOpenTwitterApp) {
        const shareOptions = {
          title: 'Share via',
          message: tweetText,
          url: `file://${filePath}`,
          social: Share.Social.TWITTER,
        };

        if (Platform.OS === 'android') {
          await Share.shareSingle(shareOptions);
        } else {
          await Share.open(shareOptions);
        }
      } else {
        await Linking.openURL(twitterWebURL);
      }

      primaryOnPress();
      setCompleteVerification(false);
    } catch (error) {
      secondaryOnPress();
      setCompleteVerification(false);
      console.error('Error sharing to Twitter:', error);
      let errorMessage = 'Something went wrong while sharing.';
      if (error?.message) {
        if (error.message.includes('couldn’t be opened')) {
          errorMessage = 'The image could not be found. Please try again.';
        } else if (error.message.includes('User did not share')) {
          errorMessage = 'Sharing was cancelled.';
        } else {
          errorMessage = error.message;
        }
      }
      Toast(errorMessage, true);
    }
  };
  return (
    <ResponsePopupContainer
      visible={visible}
      enableClose={true}
      backColor={theme.colors.modalBackColor}
      borderColor={theme.colors.modalBackColor}>
      <View style={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          <AppText variant="heading2" style={styles.titleText}>
            {assets.verificationSuccessTitle}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.verificationSuccessSubTitle}
          </AppText>
        </View>
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
                {assets.issuerVerifiedTitle}
              </AppText>
              <Text style={styles.text}>
                <Text style={[styles.text, styles.userNameStyle]}>
                  @
                  {issuerInfo.issuer &&
                    issuerInfo?.issuer?.verifiedBy[0]?.username}{' '}
                </Text>
                {assets.issuerVerifiedSubTitle}
                <Text style={[styles.text, styles.userNameStyle]}>
                  {' '}
                  {issuerInfo.name}
                </Text>
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
                  {issuerInfo.issuer &&
                  issuerInfo.assetIface.toUpperCase() === AssetFace.RGB25 ? (
                    <Image
                      source={{
                        uri: Platform.select({
                          android: `file://${
                            issuerInfo.issuer && issuerInfo?.media?.filePath
                          }`,
                          ios: issuerInfo.issuer && issuerInfo?.media?.filePath,
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
                        size={208}
                        verified={issuerInfo?.issuer?.verified}
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
                  </View>
                  {issuerInfo.issuer &&
                    issuerInfo.issuer &&
                    issuerInfo.issuer.verified && (
                      <PostIssuerVerified
                        id={
                          issuerInfo.issuer &&
                          issuerInfo.issuer.verifiedBy[0].id
                        }
                        name={
                          issuerInfo.issuer &&
                          issuerInfo.issuer.verifiedBy[0].name
                        }
                        username={
                          issuerInfo.issuer &&
                          issuerInfo.issuer.verifiedBy[0].username
                        }
                      />
                    )}
                </View>
              </ImageBackground>
            </View>
          </ImageBackground>
        </ViewShot>
        <View>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImageStyle}
            resizeMode="contain"
          />
        </View>
      </View>
      <View>
        <Buttons
          primaryTitle={common.share}
          primaryOnPress={captureAndShare}
          secondaryTitle={common.skip}
          secondaryOnPress={secondaryOnPress}
          width={windowWidth / 2.7}
          secondaryCTAWidth={windowWidth / 2.7}
        />
      </View>
    </ResponsePopupContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: -9999,
      left: -9999,
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
      marginTop: hp(25),
      width: hp(208),
      height: hp(208),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      backgroundColor: Colors.White,
      borderRadius: hp(200),
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
      overflow: 'hidden',
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
      height: 220,
      width: '100%',
      borderRadius: 10,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginVertical: hp(10),
    },
    contentContainer: {},
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
      width: wp(270),
    },
    contentWrapper: {
      marginVertical: hp(15),
    },
  });
export default PostOnTwitterModal;
