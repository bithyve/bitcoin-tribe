import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Image,
  GestureResponderEvent,
  Platform,
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

type AssetCardProps = {
  asset: Asset;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
  precision?: number;
};

const CARD_WIDTH = 160;
const CARD_HEIGHT = 210;
const COLLECTION_CARD_COLOR_1 = 'rgba(143, 143, 143, 1)'; // ! need light mode color
const COLLECTION_CARD_COLOR_2 = 'rgba(112, 112, 112, 1)';

const AssetCard = (props: AssetCardProps) => {
  const { tag, onPress, asset, precision } = props;
  const theme: AppTheme = useTheme();
  const isCollection = asset.slug ? true : false;

  const balance = useMemo(() => {
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
    const media = asset?.media?.filePath || asset.token.media.filePath;
    return Platform.select({
      android: `file://${media}`,
      ios: media,
    });
  }, [asset?.media?.filePath, asset?.token?.media.filePath]);

  const isVerified = useMemo(() => asset?.issuer?.verifiedBy?.some(
    item => item.verified === true,
  ) ?? false, [asset?.issuer?.verifiedBy]);

  const detailsText = useMemo(() => {
    if(asset.details.includes('tribecollection://')) {
      return asset.details.split('tribecollection://')[0];
    } else if(asset.details.includes('tribecollectionitem://')) {
      return asset.details.split('tribecollectionitem://')[0];
    }
    return asset.details;
  }, [asset.details]);

  return (
    <>
      {isCollection && <DummyCards styles={styles} />}
      <AppTouchable activeOpacity={1} onPress={onPress}>
        <GradientView
          style={styles.container}
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
              <Image
                source={{
                  uri: uri,
                }}
                style={styles.imageStyle}
              />
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
              {!isCollection && (
                <AppText
                  variant="body2"
                  numberOfLines={1}
                  style={styles.amountText}>
                  {balance}
                </AppText>
              )}
            </View>
          <AppText variant="body2" numberOfLines={1} style={styles.textDetails}>
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
      marginBottom: hp(20),
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
    },
  });
export default AssetCard;

const DummyCards = ({ styles }) => (
  <>
    <View
      style={[
        styles.backgroundCard,
        {
          backgroundColor: COLLECTION_CARD_COLOR_1,
          width: CARD_WIDTH * 0.88,
          top: 5,
        },
      ]}
    />
    <View
      style={[
        styles.backgroundCard,
        {
          backgroundColor: COLLECTION_CARD_COLOR_2,
          width: CARD_WIDTH * 0.96,
          top: 10,
        },
      ]}
    />
  </>
);
