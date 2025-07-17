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
import { Asset } from 'src/models/interfaces/RGBWallet';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import Colors from 'src/theme/Colors';

type AssetCardProps = {
  asset: Asset;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
  precision?: number;
};

const AssetCard = (props: AssetCardProps) => {
  const { tag, onPress, asset, precision } = props;
  const theme: AppTheme = useTheme();

  const balance = useMemo(() => {
    return formatLargeNumber(Number(asset?.balance?.future) / 10 ** precision) ?? 0;
  }, [asset?.balance?.future, precision]);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const uri = useMemo(() => {
    const media = asset?.media?.filePath || asset.token.media.filePath;
    return Platform.select({
      android: `file://${media}`,
      ios: media,
    });
  }, [asset?.media?.filePath, asset?.token?.media.filePath]);

  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.assetImageWrapper}>
          <Image
            source={{
              uri: uri,
            }}
            style={styles.imageStyle}
          />
          <View style={styles.balanceWrapper}>
            <AppText variant="caption" style={styles.balanceText}>
              {balance}
            </AppText>
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
            {asset.name}
          </AppText>
          {asset.issuer?.verified && <IconVerified width={20} height={20} />}
        </View>
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      margin: hp(6),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 15,
    },
    identiconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      height: '30%',
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleText: {
      lineHeight: hp(18),
      fontWeight: '600',
      color: theme.colors.accent1,
    },
    nameText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
      textAlign: 'center',
      marginRight: hp(2),
    },
    amountText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    assetImageWrapper: {
      width: '100%',
      height: '70%',
    },
    tagWrapper: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: -10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceWrapper: {
      backgroundColor: theme.colors.accent4,
      paddingVertical: hp(3),
      paddingHorizontal: hp(10),
      borderRadius: 15,
      alignSelf: 'center',
      top: -11,
    },
    balanceText: {
      color: Colors.Black,
      fontWeight: '500',
    },
  });
export default AssetCard;
