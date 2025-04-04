import {
  Image,
  ImageBackground,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useContext, useRef } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ModalContainer from 'src/components/ModalContainer';
import Buttons from 'src/components/Buttons';
import AppText from 'src/components/AppText';
import { AssetFace, Issuer } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AssetIcon from 'src/components/AssetIcon';
import PostIssuerVerified from './PostIssuerVerified';
import QRCode from 'react-native-qrcode-svg';
import Colors from 'src/theme/Colors';
import { AppContext } from 'src/contexts/AppContext';

interface Props {
  visible: boolean;
  primaryOnPress?: () => void;
  secondaryOnPress: () => void;
  issuerInfo: Issuer;
}

const PostOnTwitterModal: React.FC<Props> = ({
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
  const navigation = useNavigation();
  const viewShotRef = useRef<ViewShot | null>(null);

  const captureAndShare = async () => {
    try {
      if (!viewShotRef.current) return;
      setTimeout(async () => {
        const uri = await viewShotRef.current.capture();
        if (!uri) {
          console.error('Failed to capture image');
          return;
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

        const tweetText = `Issuer ${
          issuerInfo.issuer?.verifiedBy[0]?.username || ''
        } verified successfully! 🚀 #BitcoinTribe`;

        const shareOptions = {
          title: 'Share via',
          message: tweetText,
          url: `file://${filePath}`,
          social: Share.Social.TWITTER,
        };

        await Share.shareSingle(shareOptions);
      }, 1000);
      secondaryOnPress;
      setCompleteVerification(false);
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
    }
  };
  return (
    <ModalContainer
      title={assets.verificationSuccessTitle}
      subTitle={assets.verificationSuccessSubTitle}
      visible={visible}
      enableCloseIcon={false}
      onDismiss={() => navigation.goBack()}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    {issuerInfo.issuer &&
                      issuerInfo?.issuer?.verifiedBy[0]?.username}{' '}
                  </Text>
                  {assets.issuerVerifiedSubTitle}
                </Text>
                <View style={styles.qrContainer}>
                  <QRCode value="https://bitcointribe.com" size={120} />
                  <AppText variant="body2" style={styles.scanText}>
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
                            ios:
                              issuerInfo.issuer && issuerInfo?.media?.filePath,
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
                          size={200}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.verifiedViewWrapper}>
                    <View>
                      <AppText variant="body1" style={styles.assetTitleText}>
                        {issuerInfo.name}
                      </AppText>
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
        </ScrollView>
      </ScrollView>
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
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(20),
    },
    card: {
      width: 1200,
      height: 675,
      backgroundColor: '#1E1E1E',
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: hp(5),
      paddingHorizontal: hp(55),
    },
    headingText: {
      fontWeight: 'bold',
      fontSize: hp(70),
      color: theme.colors.headingColor,
      marginBottom: hp(3),
    },
    text: {
      color: theme.colors.headingColor,
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
      marginTop: hp(20),
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
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
      height: hp(440),
      width: wp(337),
      borderRadius: 15,
      margin: hp(6),
    },
    qrContainer: {
      marginTop: hp(45),
      alignItems: 'center',
      backgroundColor: 'white',
      padding: hp(3),
    },
    scanText: {
      color: Colors.Black,
      marginTop: 5,
      textAlign: 'center',
    },
    verifiedViewWrapper: {},
    assetTitleText: {
      textAlign: 'center',
      color: theme.colors.headingColor,
      marginTop: hp(15),
      marginBottom: hp(25),
      fontWeight: 'bold',
    },
    scrollWrapper: {
      height: hp(350),
      marginVertical: hp(20),
    },
  });
export default PostOnTwitterModal;
