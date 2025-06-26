import {
  Image,
  Linking,
  PixelRatio,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { useTheme } from 'react-native-paper';

import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Buttons from 'src/components/Buttons';
import AppText from 'src/components/AppText';
import { Issuer } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import Colors from 'src/theme/Colors';
import { AppContext } from 'src/contexts/AppContext';
import Toast from 'src/components/Toast';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import TwitterTemplate from 'src/components/TwitterTemplate';

interface Props {
  visible: boolean;
  primaryOnPress?: () => void;
  secondaryOnPress: () => void;
  issuerInfo: Issuer;
}

const IssueAssetPostOnTwitterModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
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
        if (uri) {setImageUri(uri);}
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
      if (!viewShotRef.current) {return;}

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
      if (!viewShotRef.current) {return;}
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
      const tweetText = `I’ve officially issued "${
        issuerInfo.name || 'this asset'
      }".\nwith Asset ID - ${issuerInfo?.assetId}

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
            {'Why Share Your Issued Asset?'}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {
              'Sharing boosts visibility — but it doesn’t prove ownership. Verify yourself to make it official.'
            }
          </AppText>
        </View>
        <TwitterTemplate viewShotRef={viewShotRef} asset={issuerInfo} />
        <View>
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
            height={hp(14)}
          />
        </View>
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
    text: {
      color: Colors.White,
      fontSize: hp(26),
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 15,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    wrapper: {
      width: '58%',
      alignItems: 'flex-start',
    },
    previewImageStyle: {
      height: 220,
      width: '100%',
      borderRadius: 10,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginBottom: hp(10),
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
      marginVertical: hp(10),
    },
  });
export default IssueAssetPostOnTwitterModal;
