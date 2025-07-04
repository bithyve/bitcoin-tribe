import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import AssetIcon from 'src/components/AssetIcon';
import {
  AssetSchema,
  Coin,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';

type allocatedAssetsProps = {
  asset: Coin | Collectible | UniqueDigitalAsset;
};

const AllocatedAssets = ({ asset }: allocatedAssetsProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const mediaPath = useMemo(() => {
    if (asset.assetSchema.toUpperCase() === AssetSchema.UDA) {
      return (asset as UniqueDigitalAsset).token.media.filePath;
    } else if (asset.assetSchema.toUpperCase() === AssetSchema.Collectible) {
      return (asset as Collectible).media.filePath;
    }
    return null;
  }, [asset.assetSchema]);

  return (
    <View style={styles.container}>
      <View key={asset.assetId}>
        {mediaPath ? (
          <Image
            source={{
              uri: Platform.select({
                android: `file://${mediaPath}`,
                ios: mediaPath,
              }),
            }}
            style={styles.assetImage}
            resizeMode="cover"
          />
        ) : (
          <AssetIcon
            iconUrl={asset.iconUrl}
            assetID={asset.assetId}
            size={30}
            verified={asset?.issuer?.verified}
          />
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {},
    assetImage: {
      width: 30,
      height: 30,
      borderRadius: 30,
      backgroundColor: theme.colors.inputBackground,
    },
    identiconView: {
      height: 30,
      width: 30,
      borderRadius: 30,
    },
  });

export default AllocatedAssets;
