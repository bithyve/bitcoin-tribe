import React, { useMemo } from 'react';
import { StyleSheet, View, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
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
  const { onPress, asset } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const balance = useMemo(() => {
    return asset?.balance?.future ?? 0;
  }, [asset?.balance?.future]);

  const styles = useMemo(
    () => getStyles(theme, isThemeDark),
    [theme, isThemeDark],
  );

  const isVerified = asset?.issuer?.verifiedBy.some(
    item => item.verified === true,
  );

  return (
    <AppTouchable onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.identiconWrapper}>
          <AssetIcon
            iconUrl={asset.iconUrl}
            assetID={asset.assetId}
            size={45}
            verified={asset?.issuer?.verified}
          />
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.row}>
            <AppText variant="heading3" style={styles.titleText}>
              {asset.ticker}
            </AppText>
            {isVerified && <IconVerified width={20} height={20} />}
          </View>
          <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
            {asset.name}
          </AppText>
        </View>
        <View style={styles.tagWrapper1}>
          <AppText variant="body2" style={styles.amountText}>
            {formatLargeNumber(Number(balance) / 10 ** asset.precision)}
          </AppText>
        </View>
      </View>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    contentWrapper: {
      flex: 1,
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
      color: isThemeDark ? theme.colors.accent : theme.colors.accent1,
      paddingHorizontal: hp(10),
      flexWrap: 'wrap',
    },
    tagWrapper1: {
      paddingVertical: hp(3),
      paddingHorizontal: hp(10),
      borderColor: isThemeDark ? theme.colors.accent : theme.colors.accent1,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'flex-end',
      marginRight: hp(10),
    },
    identiconWrapper: {
      padding: 5,
      borderRadius: 110,
      marginVertical: hp(10),
      marginHorizontal: hp(10),
    },
    verticalLineStyle: {
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
