import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import Identicon from 'src/components/Identicon';
import { Coin, Collectible, UniqueDigitalAsset } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';

type allocatedAssetsProps = {
  assets: Coin | Collectible | UniqueDigitalAsset;
};
const AllocatedAssets = ({ assets }: allocatedAssetsProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { assetId, media } = assets;
  return (
    <View style={styles.container}>
      <View key={assetId}>
        {media && media.filePath ? (
          <Image
            source={{ uri: media?.filePath }}
            style={styles.assetImage}
            resizeMode="contain"
          />
        ) : (
          <Identicon value={assetId} style={styles.identiconView} size={30} />
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
