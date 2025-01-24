import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import Identicon from 'src/components/Identicon';
import { AppTheme } from 'src/theme';

const AllocatedAssets = ({ assets, assetId }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const filteredAssets = assets.filter(asset => asset.assetId === assetId);

  return (
    <View style={styles.container}>
      {filteredAssets.map(asset => (
        <View key={asset.assetId}>
          {asset.media && asset.media.filePath ? (
            <Image
              source={{ uri: asset.media?.filePath }}
              style={styles.assetImage}
              resizeMode="contain"
            />
          ) : (
            <Identicon
              value={asset?.assetId}
              style={styles.identiconView}
              size={30}
            />
          )}
        </View>
      ))}
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
