import React, { useMemo } from 'react';
import { StyleSheet, View, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
import GradientView from './GradientView';
import { Asset } from 'src/models/interfaces/RGBWallet';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import { Keys } from 'src/storage';
import AssetIcon from './AssetIcon';

type CoinAssetCardProps = {
  asset: Asset;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const CoinAssetCard = (props: CoinAssetCardProps) => {
  const { tag, onPress, asset } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const balance = useMemo(() => {
    return asset?.balance?.future ?? 0;
  }, [asset?.balance?.future]);

  const styles = useMemo(
    () => getStyles(theme, isThemeDark),
    [theme, isThemeDark],
  );

  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.assetCardGradient1,
          theme.colors.assetCardGradient2,
          theme.colors.assetCardGradient3,
        ]}>
        <View style={styles.contentWrapper}>
          <View style={styles.row}>
            <AppText variant="heading3" style={styles.titleText}>
              {asset.ticker}
            </AppText>
            {asset.issuer?.verified && <IconVerified width={24} height={24} />}
          </View>
          <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
            {asset.name}
          </AppText>
        </View>
        <View style={styles.tagWrapper}>
          <View style={styles.tagWrapper1}>
            <AppText variant="body2" style={styles.amountText}>
              {formatLargeNumber(balance)}
            </AppText>
          </View>
        </View>
        <View style={styles.verticalLineStyle} />
        <View style={styles.identiconWrapper}>
          <AssetIcon
            assetTicker={asset.ticker}
            assetID={asset.assetId}
            size={56}
          />
        </View>
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 15,
      margin: hp(6),
      borderColor: theme.colors.borderColor,
      borderWidth: 2,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    contentWrapper: {
      width: '40%',
      paddingVertical: hp(10),
      paddingLeft: hp(16),
    },
    titleText: {
      lineHeight: hp(25),
      fontWeight: '600',
      color: theme.colors.headingColor,
      marginRight: hp(2),
    },
    nameText: {
      fontWeight: '300',
      color: theme.colors.secondaryHeadingColor,
      flexWrap: 'wrap',
    },
    amountText: {
      fontWeight: '500',
      color: theme.colors.popupSentCTATitleColor,
      flexWrap: 'wrap',
    },
    tagWrapper: {
      width: '29%',
      alignItems: 'flex-end',
      paddingRight: hp(10),
    },
    tagWrapper1: {
      paddingVertical: hp(3),
      paddingHorizontal: hp(10),
      backgroundColor: isThemeDark ? theme.colors.accent : theme.colors.accent1,
      borderRadius: 15,
    },
    identiconWrapper: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 1,
      padding: 5,
      borderRadius: 110,
      marginVertical: hp(10),
      marginHorizontal: hp(10),
    },
    verticalLineStyle: {
      height: '100%',
      width: 1.5,
      backgroundColor: theme.colors.assetCardVerticalBorder,
      marginHorizontal: hp(5),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
export default CoinAssetCard;
