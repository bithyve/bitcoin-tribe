import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Asset, AssetFace, UtxoType } from 'src/models/interfaces/RGBWallet';
import { Keys } from 'src/storage';
import IconBitcoin from 'src/assets/images/icon_btc2.svg';
import IconBitcoinLight from 'src/assets/images/icon_btc2_light.svg';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AllocatedAssets from './components/AllocatedAssets';
import IconVerified from 'src/assets/images/issuer_verified.svg'

type UnspentUTXOElementProps = {
  transID: string;
  satsAmount: string;
  rgbAllocations: any;
  style?: StyleProp<ViewStyle>;
  assets: Asset[];
  mode: UtxoType;
};
function UnspentUTXOElement({
  transID,
  satsAmount,
  rgbAllocations,
  style,
  assets,
  mode,
}: UnspentUTXOElementProps) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = React.useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const assetMap = React.useMemo(() => {
    if (!assets) return {};
    return assets.reduce((map, asset) => {
      map[asset.assetId] = {
        assetId: asset.assetId,
        name: asset.name,
        ...asset,
      };
      return map;
    }, {} as Record<string, { assetId: string; name: string } & (typeof assets)[0]>);
  }, [assets]);

  return (
    <GradientView
      style={[styles.container, style]}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View></View>
      <View>
        {rgbAllocations?.map(allocation => {
          const assetName = allocation.assetId
            ? assetMap[allocation.assetId]?.name
            : null;
          return (
            allocation.assetId && (
              <View key={allocation.assetId} style={styles.allocationWrapper}>
                <View style={styles.allocationWrapper1}>
                  <AllocatedAssets asset={assetMap[allocation.assetId]} />
                  <AppText variant="heading3" style={styles.assetNameText}>
                    {assetName}
                  </AppText>
                  {assetMap[allocation.assetId]?.issuer?.verified && (
                    <IconVerified width={24} height={24} />
                  )}
                </View>
                {
                  assetMap[allocation.assetId]?.assetIface.toUpperCase() !== AssetFace.RGB21 && (
                    <AppText variant="body2" style={styles.assetAmountText}>
                      {numberWithCommas(allocation.amount)}
                    </AppText>
                  )
                }
              </View>
            )
          );
        }) ?? <View />}
      </View>
      {rgbAllocations?.some(allocation => allocation?.assetId)
        ? rgbAllocations.map((allocation, index) => {
            const assetID = allocation?.assetId;
            return assetID ? (
              <AppText
                key={assetID}
                variant="caption"
                style={styles.assetIdStyle}>
                {assetID}
              </AppText>
            ) : null;
          })
        : null}
      <View style={styles.contentWrapper}>
        <View style={styles.transIDWrapper}>
          <AppText variant="body2" style={styles.labelTextStyle}>
            {mode === UtxoType.Uncolored
              ? 'Value'
              : walletTranslations.availableTxnFee}
          </AppText>
        </View>
        <View style={styles.amtWrapper}>
          <View style={styles.amtIconWrapper}>
            {initialCurrencyMode !== CurrencyKind.SATS &&
              getCurrencyIcon(
                isThemeDark ? IconBitcoin : IconBitcoinLight,
                isThemeDark ? 'dark' : 'light',
              )}
            <AppText
              variant="body2"
              style={[
                styles.amountText,
                {
                  fontSize: satsAmount.toString().length > 10 ? 11 : 16,
                },
              ]}>
              &nbsp;{isNaN(Number(satsAmount)) ? 0 : getBalance(Number(satsAmount))}
            </AppText>
            {initialCurrencyMode === CurrencyKind.SATS && (
              <AppText variant="caption" style={styles.satsText}>
                sats
              </AppText>
            )}
          </View>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText variant="body2" style={styles.labelTextStyle}>
            {walletTranslations.output}
          </AppText>
        </View>
        <View style={styles.transIDWrapper}>
          <AppText
            variant="body2"
            style={styles.transIDText}
            numberOfLines={1}
            ellipsizeMode="middle">
            {transID}
          </AppText>
        </View>
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
      marginVertical: hp(3),
    },
    transIDWrapper: {
      width: '65%',
    },
    amtWrapper: {
      width: '35%',
      alignItems: 'flex-end',
    },
    transIDText: {
      color: theme.colors.headingColor,
      textAlign: 'right',
    },
    amountText: {
      color: theme.colors.headingColor,
    },
    assetIDText: {
      color: theme.colors.secondaryHeadingColor,
    },
    labelWrapper: {
      width: '35%',
      alignItems: 'flex-start',
    },
    assetNameText: {
      color: theme.colors.headingColor,
      marginLeft: hp(10),
    },
    labelTextStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetAmountText: {
      color: theme.colors.headingColor,
    },
    allocationWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(12),
    },
    allocationWrapper1: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amtIconWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    satsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    assetIdStyle: {
      marginVertical: hp(3),
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default UnspentUTXOElement;
