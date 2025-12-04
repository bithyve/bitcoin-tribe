import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  GestureResponderEvent,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
import GradientView from './GradientView';
import { Asset, AssetSchema } from 'src/models/interfaces/RGBWallet';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import AssetIcon from './AssetIcon';
import Colors from 'src/theme/Colors';
import DeepLinking from 'src/utils/DeepLinking';
import { isWebUrl } from 'src/utils/url';
import { CustomImage } from './CustomImage';

type AssetCardProps = {
  asset: Asset;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
  precision?: number;
  isCollectionUda?: boolean; // uda inside a collection
};

const CARD_WIDTH = 160;
const CARD_HEIGHT = 210;
const AssetCard = (props: AssetCardProps) => {
  const { tag, onPress, asset, precision, isCollectionUda = false } = props;
  const theme: AppTheme = useTheme();
  const isCollection = asset.slug ? true : false;
  const [imageLoading, setImageLoading] = useState(false);

  const balance = useMemo(() => {
    if (asset.assetSchema === AssetSchema.UDA) {
      if (asset.balance.spendable === '1') {
        return 'Owned';
      }
      return '';
    }
    return (
      formatLargeNumber(Number(asset?.balance?.future) / 10 ** precision) ?? 0
    );
  }, [asset?.balance?.future, precision]);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const details = useMemo(() => {
    if (asset.assetSchema === AssetSchema.Coin) return asset.ticker;
    return asset.details;
  }, [asset.assetSchema, asset.ticker, asset.details]);

  const uri = useMemo(() => {
    if (asset.assetSchema === AssetSchema.Coin) return '';
    const media = asset?.media?.filePath || asset?.token?.media?.filePath;
    if (media) {
      if (isWebUrl(media)) {
        return media;
      }
      return Platform.select({
        android: `file://${media}`,
        ios: media,
      });
    }
    return null;
  }, [asset?.media?.filePath, asset?.token?.media.filePath]);

  const isVerified = useMemo(
    () =>
      asset?.issuer?.verifiedBy?.some(item => item.verified === true) ?? false,
    [asset?.issuer?.verifiedBy],
  );

  const detailsText = useMemo(() => {
    if (asset?.details?.includes(`${DeepLinking.scheme}`)) {
      return asset?.details?.split(`${DeepLinking.scheme}`)[0];
    }
    return asset?.details;
  }, [asset?.details]);

  return (
    <>
      {isCollection && <DummyCards styles={styles} />}
      <AppTouchable activeOpacity={1} onPress={onPress}>
        <GradientView
          style={[
            styles.container,
            asset.assetSchema === AssetSchema.UDA &&
              balance == 'Owned' && { borderColor: Colors.ElectricViolet },
          ]}
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}>
          <View style={styles.assetImageWrapper}>
            {asset.assetSchema === AssetSchema.Coin ? (
              <AssetIcon
                iconUrl={asset.iconUrl}
                assetID={asset.assetId}
                size={120}
                verified={asset?.issuer?.verified}
              />
            ) : (
              <CustomImage uri={uri} imageStyle={styles.imageStyle}/>
            )}
          </View>
          <View style={styles.contentWrapper}>
            <View style={styles.row}>
              <View style={styles.nameContainer}>
                <AppText
                  variant="body2"
                  numberOfLines={1}
                  style={styles.nameText}>
                  {asset.name}
                </AppText>
                {isVerified && <IconVerified width={20} height={20} />}
              </View>
              {(asset.assetSchema !== AssetSchema.UDA)   && (
                <AppText
                  variant="body2"
                  numberOfLines={1}
                  style={styles.amountText}>
                  {balance}
                </AppText>
              )}
            </View>
            <AppText
              variant="body2"
              numberOfLines={1}
              style={styles.textDetails}>
              {detailsText}
            </AppText>
          </View>
        </GradientView>
      </AppTouchable>
    </>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: wp(CARD_WIDTH),
      height: hp(CARD_HEIGHT),
      borderRadius: 15,
      margin: hp(5),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginTop: 15,
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    identiconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      height: '30%',
      padding: 10,
    },
    nameText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      marginRight: hp(2),
    },
    amountText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginRight: hp(2),
    },
    assetImageWrapper: {
      width: '100%',
      height: '70%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(6),
    },
    row: {
      flexDirection: 'row',
      flex: 1,
    },
    nameContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    textDetails: {
      fontWeight: '300',
      color: theme.colors.secondaryHeadingColor,
    },
    backgroundCard: {
      position: 'absolute',
      height: CARD_HEIGHT / 2,
      alignSelf: 'center',
      borderRadius: 15,
      padding: 1,
    },
    innerCard: {
      flex: 1,
      borderRadius: 15,
    },
  });
export default AssetCard;

const DummyCards = ({ styles }) => {
  const theme: AppTheme = useTheme();
  const cardColor: GradientColors = useMemo(() => {
    if (theme.dark) {
      return {
        outerBorder: [
          Colors.DarkCharcoal,
          'rgba(21, 21, 21, 1)',
          'rgba(21, 21, 21, 1)',
        ],
        outerColor: [
          'rgba(26, 26, 26, 1)',
          'rgba(18, 18, 18, 1)',
          'rgba(18, 18, 18, 1)',
        ],
        innerBorder: [
          Colors.DarkCharcoal,
          'rgba(21, 21, 21, 1)',
          'rgba(21, 21, 21, 1)',
        ],
        innerColor: [
          'rgba(26, 26, 26, 1)',
          'rgba(18, 18, 18, 1)',
          'rgba(18, 18, 18, 1)',
        ],
      };
    } else {
      return {
        outerBorder: [
          'rgba(232, 232, 232, 1)',
          'rgba(232, 232, 232, 1)',
          'rgba(232, 232, 232, 1)',
        ],
        outerColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
        ],
        innerBorder: [
          'rgba(232, 232, 232, 1)',
          'rgba(232, 232, 232, 1)',
          'rgba(232, 232, 232, 1)',
        ],
        innerColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
        ],
      };
    }
  }, [theme]);

  return (
    <>
      <GradientView
        colors={cardColor?.outerBorder}
        style={[
          styles.backgroundCard,
          {
            width: wp(CARD_WIDTH) * 0.88,
            top: 5,
          },
        ]}>
        <GradientView colors={cardColor?.outerColor} style={styles.innerCard}>
          <></>
        </GradientView>
      </GradientView>
      <GradientView
        colors={cardColor?.innerBorder}
        style={[
          styles.backgroundCard,
          {
            width: wp(CARD_WIDTH) * 0.96,
            top: 10,
          },
        ]}>
        <GradientView colors={cardColor?.innerColor} style={styles.innerCard}>
          <></>
        </GradientView>
      </GradientView>
    </>
  );
};

type GradientColors = {
  outerBorder: [string, string, string];
  outerColor: [string, string, string];
  innerBorder: [string, string, string];
  innerColor: [string, string, string];
};
