import React, { useContext } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import Colors from 'src/theme/Colors';
import AssetIcon from './AssetIcon';
import AppText from './AppText';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import AppLogo from 'src/assets/images/websiteLogo.svg';
import GradientView from './GradientView';
import IconX from 'src/assets/images/icon_x.svg';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import IconDomainVerified from 'src/assets/images/issuer_domain_verified.svg';
import Fonts from 'src/constants/Fonts';

type TwitTemplateProps = {
  viewShotRef: React.RefObject<ViewShot>;
  asset: Asset;
};

type InfoItemProps = {
  title: string;
  value: string;
};

type PostInfoItemProps = {
  id?: string;
  name: string;
  username: string;
};

type DomainInfoItemProps = {
  domain: string;
};

const InfoItem = (props: InfoItemProps) => {
  const { title, value } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <GradientView
      style={styles.infoItemcontainer}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.titleWrapper}>
        <AppText variant="body1" style={styles.text}>
          {title}
        </AppText>
      </View>
      <View style={styles.valueWrapper}>
        <AppText variant="body1" style={styles.text}>
          {value}
        </AppText>
      </View>
    </GradientView>
  );
};

const PostInfoItem = (props: PostInfoItemProps) => {
  const { name, username } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <GradientView
      style={styles.verifyInfoItemcontainer}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.verifiedWrapper}>
        <AppText variant="body1" style={styles.title}>
          Issuer Verified via 𝕏
        </AppText>
        <View style={styles.iconWrapper}>
          <IconX />
          <View>
            <AppText variant="body2" style={styles.textName}>
              {name}
            </AppText>
            <AppText variant="body2" style={styles.textUsername}>
              @{username}
            </AppText>
          </View>
        </View>
      </View>
      <IconVerified />
    </GradientView>
  );
};

const DomainInfoItem = (props: DomainInfoItemProps) => {
  const { domain } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <GradientView
      style={styles.verifyInfoItemcontainer}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.verifiedWrapper}>
        <AppText>Domain Verified</AppText>
        <AppText>{domain}</AppText>
      </View>
      <IconDomainVerified />
    </GradientView>
  );
};

function TwitterTemplate(props: TwitTemplateProps) {
  const { viewShotRef, asset } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'jpg', quality: 1.0, width: 1200, height: 675 }}
      style={styles.container}>
      <View style={styles.card}>
        <View style={styles.assetInfoContainer}>
          <View>
            <AppLogo />
          </View>
          <View style={styles.headingWrapper}>
            <AppText variant="heading1" style={styles.headingText}>
              Verified & Issued on Bitcoin Tribe!
            </AppText>
            <Text style={styles.text}>
              <Text>{asset.name}</Text> - <Text>{asset.ticker}</Text> is now
              live on Bitcoin Tribe — transparently issued and verified via X
              (Twitter), leveraging the power of RGB smart contracts on Bitcoin.
            </Text>
          </View>
          <InfoItem title="Asset name:" value={asset.name} />
          <InfoItem title="Issued on:" value="21 April 2025" />
          <InfoItem title="Issued supply: " value="21 April 2025" />
          <PostInfoItem name="Tether" username="Tether_to" />
          <DomainInfoItem domain="www.bitcointribe.app" />
        </View>
        <View style={styles.assetIconContainer}>
          <View>
            {asset.issuer &&
            asset.assetIface.toUpperCase() === AssetFace.RGB25 ? (
              <Image
                source={{
                  uri: Platform.select({
                    android: `file://${asset.issuer && asset?.media?.filePath}`,
                    ios: asset.issuer && asset?.media?.filePath,
                  }),
                }}
                resizeMode="cover"
                style={styles.imageStyle}
              />
            ) : asset.assetIface.toUpperCase() === AssetFace.RGB21 ? (
              <Image
                source={{
                  uri: Platform.select({
                    android: `file://${
                      asset.token && asset?.token.media?.filePath
                    }`,
                    ios: asset.token && asset?.token.media?.filePath,
                  }),
                }}
                resizeMode="cover"
                style={styles.imageStyle}
              />
            ) : (
              <View style={styles.identiconWrapper}>
                <AssetIcon
                  assetTicker={asset.ticker && asset?.ticker}
                  assetID={asset.assetId && asset?.assetId}
                  size={208}
                  verified={asset?.issuer?.verified}
                />
              </View>
            )}
          </View>
          <View>
            <AppText style={styles.tickerTextStyle}>USDT</AppText>
          </View>
          <View>
            <View style={styles.qrContainer}>
              <QRCode value="https://bitcointribe.app/" size={156} />
            </View>
            <AppText variant="body1" style={styles.scanText}>
              Scan Me!
            </AppText>
          </View>
        </View>
      </View>
    </ViewShot>
  );
}
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
      gap: 10,
    },
    headingText: {
      fontWeight: 'bold',
      fontSize: hp(40),
      color: Colors.White,
      marginBottom: hp(3),
    },
    text: {
      color: Colors.White,
      fontSize: hp(17),
      textAlign: 'left',
    },
    infoItemcontainer: {
      flexDirection: 'row',
      width: '90%',
      marginVertical: hp(5),
      minHeight: hp(50),
    },
    verifyInfoItemcontainer: {
      flexDirection: 'row',
      width: '90%',
      marginVertical: hp(5),
      minHeight: hp(75),
      alignItems: 'center',
    },
    assetInfoContainer: {
      width: '70%',
    },
    textName: {
      color: Colors.White,
    },
    textUsername: {
      color: Colors.SonicSilver,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      color: Colors.White,
    },
    assetIconContainer: {
      borderRadius: hp(20),
      backgroundColor: theme.colors.settingMenuHeader,
      height: hp(514),
      width: hp(297),
      alignItems: 'center',
    },
    imageStyle: {
      width: hp(206),
      height: hp(206),
      borderRadius: hp(206),
    },
    identiconWrapper: {
      zIndex: 999,
      alignSelf: 'center',
      marginTop: hp(25),
      width: hp(206),
      height: hp(206),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      backgroundColor: Colors.White,
      borderRadius: hp(206),
    },
    tickerTextStyle: {
      color: Colors.White,
      fontSize: 26,
      fontFamily: Fonts.LufgaSemiBold,
      marginVertical: hp(10),
    },
    qrContainer: {
      marginTop: hp(10),
      alignItems: 'center',
      backgroundColor: 'white',
      padding: hp(5),
    },
    scanText: {
      color: Colors.White,
      marginTop: hp(10),
      textAlign: 'center',
      fontSize: hp(20),
    },
    titleWrapper: {
      width: '50%',
      justifyContent: 'center',
      paddingLeft: hp(20),
    },
    valueWrapper: {
      width: '50%',
      justifyContent: 'center',
    },
    verifiedWrapper: {
      width: '50%',
      paddingLeft: hp(20),
    },
    headingWrapper: {
      marginVertical: hp(20),
    },
  });
export default TwitterTemplate;
