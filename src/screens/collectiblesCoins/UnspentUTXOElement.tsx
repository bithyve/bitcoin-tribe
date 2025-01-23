import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import { Asset } from 'src/models/interfaces/RGBWallet';

import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type UnspentUTXOElementProps = {
  transID: string;
  satsAmount: string;
  rgbAllocations: any;
  style?: StyleProp<ViewStyle>;
  assets: Asset[];
};
function UnspentUTXOElement({
  transID,
  satsAmount,
  rgbAllocations,
  style,
  assets,
}: UnspentUTXOElementProps) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const assetMap = React.useMemo(() => {
    if (!assets) return {};
    return assets.reduce((map, asset) => {
      map[asset.assetId] = asset.name;
      return map;
    }, {} as Record<string, string>);
  }, [assets]);

  return (
    <GradientView
      style={[styles.container, style]}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.contentWrapper}>
        <View style={styles.transIDWrapper}>
          <AppText
            variant="body2"
            style={styles.transIDText}
            numberOfLines={1}
            ellipsizeMode="middle">
            {transID}
          </AppText>
        </View>
        <View style={styles.amtWrapper}>
          <AppText variant="body2" style={styles.amountText}>
            &nbsp;{numberWithCommas(satsAmount)} sats
          </AppText>
        </View>
      </View>
      <View>
        {rgbAllocations?.map(allocation => {
          const assetName = allocation.assetId
            ? assetMap[allocation.assetId]
            : null;
          return (
            allocation.assetId && (
              <View key={allocation.assetId} style={styles.allocationWrapper}>
                <AppText
                  variant="caption"
                  style={styles.assetIDText}>
                  {assetName}
                </AppText>
                <AppText
                  variant="caption"
                  style={styles.assetIDText}>
                  {numberWithCommas(allocation.amount)}
                </AppText>
              </View>
            )
          );
        }) ?? (
          <View/>
        )}
      </View>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    transIDWrapper: {
      width: '70%',
    },
    amtWrapper: {
      width: '30%',
      alignItems: 'flex-end',
    },
    transIDText: {
      color: theme.colors.headingColor,
    },
    amountText: {
      color: theme.colors.headingColor,
    },
    assetIDText: {
      marginTop: hp(3),
      color: theme.colors.secondaryHeadingColor,
    },
    allocationWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
export default UnspentUTXOElement;
