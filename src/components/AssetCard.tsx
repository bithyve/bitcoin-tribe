import React, { useMemo } from 'react';
import { StyleSheet, View, Image, GestureResponderEvent, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp, windowHeight } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import GradientView from './GradientView';
import Capitalize from 'src/utils/capitalizeUtils';
import AssetChip from './AssetChip';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import Identicon from './Identicon';

type AssetCardProps = {
  asset: Asset;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const AssetCard = (props: AssetCardProps) => {
  const {
    tag,
    onPress,
    asset,
  } = props;
  const theme: AppTheme = useTheme();

  const balance = useMemo(() => {
    return asset.balance.future;
  }, [asset.balance.future]);

  const styles = useMemo(
    () => getStyles(theme),
    [theme],
  );

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
          {asset.assetIface.toUpperCase() === AssetFace.RGB25 ? (
            <Image
              source={{
                uri: Platform.select({
                  android: `file://${asset.media?.filePath}`,
                  ios: asset.media?.filePath,
                }),
              }}
              style={styles.imageStyle}
            />
          ) : (
            <View style={styles.identiconWrapper}>
              <View style={styles.identiconWrapper2}>
                <Identicon
                  value={asset.assetId}
                  style={styles.identiconView}
                  size={windowHeight > 670 ? 110 : 90}
                />
              </View>
            </View>
          )}
          <View style={styles.tagWrapper}>
            <AssetChip
              tagText={Capitalize(tag)}
              backColor={
                tag === 'COIN' ? theme.colors.accent5 : theme.colors.accent4
              }
              tagColor={theme.colors.tagText}
            />
          </View>
        </View>
        <View style={styles.contentWrapper}>
          {asset.ticker && <AppText variant="caption" style={styles.titleText}>
            {asset.ticker}
          </AppText>}
          <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
            {asset.name}
          </AppText>
          <AppText
            variant="caption"
            style={styles.amountText}
            numberOfLines={1}>
            {numberWithCommas(balance)}
          </AppText>
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
      // borderRadius: 10,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    identiconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
    },
    identiconView: {
      height: windowHeight > 670 ? 110 : 90,
      width: windowHeight > 670 ? 110 : 90,
      borderRadius: windowHeight > 670 ? 110 : 90,
    },
    contentWrapper: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      height: '30%',
      justifyContent: 'center',
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
    },
    amountText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    detailsText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    assetImageWrapper: {
      width: '100%',
      height: '70%',
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 0.8,
    },
    tagWrapper: {
      position: 'absolute',
      left: 15,
      bottom: 10,
    },
  });
export default AssetCard;
